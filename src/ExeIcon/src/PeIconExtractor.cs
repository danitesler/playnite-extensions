using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace ExeIcon
{
    /// <summary>
    /// Reads the first icon group from a PE file's resources and rebuilds it as a .ico with every size.
    /// Managed parsing instead of Win32 so every size (including 256px PNG frames) survives,
    /// which System.Drawing.Icon.ExtractAssociatedIcon (32px only) does not do.
    /// </summary>
    internal static class PeIconExtractor
    {
        private const int ResourceTypeIcon = 3;
        private const int ResourceTypeGroupIcon = 14;
        private const int DataDirectoryResourceIndex = 2;
        private const long MaxResourceSectionBytes = 64L * 1024 * 1024;
        private const int MaxIconsPerGroup = 64;

        public static byte[] TryExtractIco(string path)
        {
            try
            {
                using (var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite | FileShare.Delete))
                {
                    return ExtractIco(stream);
                }
            }
            catch (Exception ex) when (ex is IOException || ex is UnauthorizedAccessException || ex is ArgumentException || ex is NotSupportedException || ex is System.Security.SecurityException)
            {
                return null;
            }
        }

        internal static byte[] ExtractIco(Stream stream)
        {
            var section = ReadResourceSection(stream);
            if (section == null)
            {
                return null;
            }

            try
            {
                return BuildIco(section);
            }
            catch (Exception ex) when (ex is ArgumentException || ex is IndexOutOfRangeException || ex is OverflowException)
            {
                // Malformed resource tree.
                return null;
            }
        }

        private static ResourceSection ReadResourceSection(Stream stream)
        {
            if (stream.Length < 0x40)
            {
                return null;
            }

            var reader = new BinaryReader(stream);
            stream.Position = 0;
            if (reader.ReadUInt16() != 0x5A4D)
            {
                return null; // "MZ"
            }

            stream.Position = 0x3C;
            var peOffset = reader.ReadInt32();
            if (peOffset <= 0 || peOffset > stream.Length - 24)
            {
                return null;
            }

            stream.Position = peOffset;
            if (reader.ReadUInt32() != 0x00004550)
            {
                return null; // "PE\0\0"
            }

            reader.ReadUInt16(); // Machine
            int sectionCount = reader.ReadUInt16();
            stream.Position += 12; // TimeDateStamp, PointerToSymbolTable, NumberOfSymbols
            int optionalHeaderSize = reader.ReadUInt16();
            reader.ReadUInt16(); // Characteristics

            var optionalHeaderStart = stream.Position;
            var magic = reader.ReadUInt16();
            int dataDirectoriesOffset;
            if (magic == 0x10B)
            {
                dataDirectoriesOffset = 96; // PE32
            }
            else if (magic == 0x20B)
            {
                dataDirectoriesOffset = 112; // PE32+
            }
            else
            {
                return null;
            }

            if (optionalHeaderSize < dataDirectoriesOffset + (DataDirectoryResourceIndex + 1) * 8)
            {
                return null;
            }

            stream.Position = optionalHeaderStart + dataDirectoriesOffset - 4;
            if (reader.ReadUInt32() <= DataDirectoryResourceIndex)
            {
                return null; // NumberOfRvaAndSizes
            }

            stream.Position = optionalHeaderStart + dataDirectoriesOffset + DataDirectoryResourceIndex * 8;
            var resourceRva = reader.ReadUInt32();
            var resourceSize = reader.ReadUInt32();
            if (resourceRva == 0 || resourceSize == 0)
            {
                return null;
            }

            stream.Position = optionalHeaderStart + optionalHeaderSize;
            for (var i = 0; i < sectionCount; i++)
            {
                if (stream.Position + 40 > stream.Length)
                {
                    return null;
                }

                stream.Position += 8; // Name
                var virtualSize = reader.ReadUInt32();
                var virtualAddress = reader.ReadUInt32();
                var rawSize = reader.ReadUInt32();
                var rawPointer = reader.ReadUInt32();
                stream.Position += 16; // Relocations, line numbers, characteristics

                var span = Math.Max(virtualSize, rawSize);
                if (resourceRva < virtualAddress || resourceRva >= (long)virtualAddress + span)
                {
                    continue;
                }

                var length = Math.Min(rawSize, stream.Length - rawPointer);
                if (length <= 0 || length > MaxResourceSectionBytes)
                {
                    return null;
                }

                var data = new byte[length];
                stream.Position = rawPointer;
                var read = 0;
                while (read < length)
                {
                    var chunk = stream.Read(data, read, (int)length - read);
                    if (chunk <= 0)
                    {
                        return null;
                    }

                    read += chunk;
                }

                return new ResourceSection(data, virtualAddress, resourceRva - virtualAddress);
            }

            return null;
        }

        private static byte[] BuildIco(ResourceSection section)
        {
            var root = section.ReadDirectory(section.RootOffset);
            var groupType = root.FirstOrDefault(e => !e.IsNamed && e.Id == ResourceTypeGroupIcon && e.IsDirectory);
            var iconType = root.FirstOrDefault(e => !e.IsNamed && e.Id == ResourceTypeIcon && e.IsDirectory);
            if (groupType == null || iconType == null)
            {
                return null;
            }

            // Explorer shows the first group in resource order (named entries sort before numeric IDs).
            var group = section.ReadDirectory(section.RootOffset + groupType.Offset).FirstOrDefault();
            var groupData = group == null ? null : section.ReadFirstLanguageData(group);
            if (groupData == null || groupData.Length < 6
                || BitConverter.ToUInt16(groupData, 0) != 0
                || BitConverter.ToUInt16(groupData, 2) != 1)
            {
                return null;
            }

            var iconsById = new Dictionary<int, ResourceEntry>();
            foreach (var entry in section.ReadDirectory(section.RootOffset + iconType.Offset))
            {
                if (!entry.IsNamed && !iconsById.ContainsKey(entry.Id))
                {
                    iconsById[entry.Id] = entry;
                }
            }

            var count = Math.Min((int)BitConverter.ToUInt16(groupData, 4), MaxIconsPerGroup);
            var frames = new List<IconFrame>();
            for (var i = 0; i < count; i++)
            {
                var offset = 6 + i * 14;
                if (offset + 14 > groupData.Length)
                {
                    break;
                }

                var id = BitConverter.ToUInt16(groupData, offset + 12);
                if (!iconsById.TryGetValue(id, out var iconEntry))
                {
                    continue;
                }

                var image = section.ReadFirstLanguageData(iconEntry);
                if (image == null || image.Length == 0)
                {
                    continue;
                }

                frames.Add(new IconFrame
                {
                    Width = groupData[offset],
                    Height = groupData[offset + 1],
                    ColorCount = groupData[offset + 2],
                    Planes = BitConverter.ToUInt16(groupData, offset + 4),
                    BitCount = BitConverter.ToUInt16(groupData, offset + 6),
                    Image = image
                });
            }

            return frames.Count == 0 ? null : WriteIco(frames);
        }

        private static byte[] WriteIco(List<IconFrame> frames)
        {
            using (var output = new MemoryStream())
            using (var writer = new BinaryWriter(output))
            {
                writer.Write((ushort)0); // Reserved
                writer.Write((ushort)1); // Type: icon
                writer.Write((ushort)frames.Count);

                var imageOffset = 6 + frames.Count * 16;
                foreach (var frame in frames)
                {
                    writer.Write(frame.Width);
                    writer.Write(frame.Height);
                    writer.Write(frame.ColorCount);
                    writer.Write((byte)0);
                    writer.Write(frame.Planes);
                    writer.Write(frame.BitCount);
                    writer.Write(frame.Image.Length);
                    writer.Write(imageOffset);
                    imageOffset += frame.Image.Length;
                }

                foreach (var frame in frames)
                {
                    writer.Write(frame.Image);
                }

                writer.Flush();
                return output.ToArray();
            }
        }

        private sealed class IconFrame
        {
            public byte Width;
            public byte Height;
            public byte ColorCount;
            public ushort Planes;
            public ushort BitCount;
            public byte[] Image;
        }

        private sealed class ResourceEntry
        {
            public bool IsNamed;
            public int Id;
            public bool IsDirectory;
            public int Offset;
        }

        private sealed class ResourceSection
        {
            private readonly byte[] data;
            private readonly uint virtualAddress;

            public ResourceSection(byte[] data, uint virtualAddress, long rootOffset)
            {
                this.data = data;
                this.virtualAddress = virtualAddress;
                RootOffset = (int)rootOffset;
            }

            public int RootOffset { get; }

            public List<ResourceEntry> ReadDirectory(int offset)
            {
                var entries = new List<ResourceEntry>();
                if (offset < 0 || offset + 16 > data.Length)
                {
                    return entries;
                }

                var total = BitConverter.ToUInt16(data, offset + 12) + BitConverter.ToUInt16(data, offset + 14);
                for (var i = 0; i < total; i++)
                {
                    var entryOffset = offset + 16 + i * 8;
                    if (entryOffset + 8 > data.Length)
                    {
                        break;
                    }

                    var name = BitConverter.ToUInt32(data, entryOffset);
                    var target = BitConverter.ToUInt32(data, entryOffset + 4);
                    entries.Add(new ResourceEntry
                    {
                        IsNamed = (name & 0x80000000) != 0,
                        Id = (int)(name & 0xFFFF),
                        IsDirectory = (target & 0x80000000) != 0,
                        Offset = (int)(target & 0x7FFFFFFF)
                    });
                }

                return entries;
            }

            // Name entry -> language directory -> data entry. Any language will do for icons.
            public byte[] ReadFirstLanguageData(ResourceEntry entry)
            {
                var dataEntryOffset = entry.Offset;
                if (entry.IsDirectory)
                {
                    var language = ReadDirectory(RootOffset + entry.Offset).FirstOrDefault(e => !e.IsDirectory);
                    if (language == null)
                    {
                        return null;
                    }

                    dataEntryOffset = language.Offset;
                }

                var position = RootOffset + dataEntryOffset;
                if (position < 0 || position + 16 > data.Length)
                {
                    return null;
                }

                var rva = BitConverter.ToUInt32(data, position);
                var size = BitConverter.ToUInt32(data, position + 4);
                var start = (long)rva - virtualAddress;
                if (size == 0 || start < 0 || start + size > data.Length)
                {
                    return null;
                }

                var bytes = new byte[size];
                Buffer.BlockCopy(data, (int)start, bytes, 0, (int)size);
                return bytes;
            }
        }
    }
}
