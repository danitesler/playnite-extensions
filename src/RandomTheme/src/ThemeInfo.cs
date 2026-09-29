using Playnite.SDK;

namespace RandomTheme
{
    /// <summary>
    /// An installed Playnite theme that can be used in the given application mode.
    /// </summary>
    public sealed class ThemeInfo
    {
        public string Id { get; }
        public string Name { get; }
        public string DirectoryPath { get; }
        public ApplicationMode Mode { get; }

        public ThemeInfo(string id, string name, string directoryPath, ApplicationMode mode)
        {
            Id = id;
            Name = name;
            DirectoryPath = directoryPath;
            Mode = mode;
        }

        public override string ToString() => $"{Name} ({Id})";
    }
}
