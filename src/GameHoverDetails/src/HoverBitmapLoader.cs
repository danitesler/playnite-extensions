using System;
using System.IO;
using System.Windows.Media.Imaging;
using Playnite.SDK;
using Playnite.SDK.Models;

namespace GameHoverDetails
{
    internal static class HoverBitmapLoader
    {
        public static BitmapImage TryLoadGameArt(string fieldKey, Game game, IPlayniteAPI api)
        {
            if (game == null || api?.Database == null)
            {
                return null;
            }

            string refId;
            int decodePixels;
            switch (fieldKey)
            {
                case "Icon":
                    refId = game.Icon;
                    decodePixels = 96;
                    break;
                case "CoverImage":
                    refId = game.CoverImage;
                    decodePixels = 480;
                    break;
                case "BackgroundImage":
                    refId = game.BackgroundImage;
                    decodePixels = 360;
                    break;
                default:
                    return null;
            }

            return TryLoadFromRef(refId, api, decodePixels);
        }

        public static BitmapImage TryLoadPlatformIcon(Platform platform, IPlayniteAPI api, int decodePixels = 96)
        {
            if (platform == null || api?.Database == null || string.IsNullOrWhiteSpace(platform.Icon))
            {
                return null;
            }

            return TryLoadFromRef(platform.Icon, api, decodePixels);
        }

        private static BitmapImage TryLoadFromRef(string refId, IPlayniteAPI api, int decodePixels)
        {
            if (string.IsNullOrWhiteSpace(refId))
            {
                return null;
            }

            try
            {
                Uri uri;
                var t = refId.Trim();
                if (t.StartsWith("http://", StringComparison.OrdinalIgnoreCase)
                    || t.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
                {
                    uri = new Uri(t, UriKind.Absolute);
                }
                else
                {
                    var path = api.Database.GetFullFilePath(refId);
                    if (string.IsNullOrEmpty(path) || !File.Exists(path))
                    {
                        return null;
                    }

                    uri = new Uri(path, UriKind.Absolute);
                }

                var bmp = new BitmapImage();
                bmp.BeginInit();
                bmp.CacheOption = BitmapCacheOption.OnLoad;
                bmp.UriSource = uri;
                if (decodePixels > 0)
                {
                    bmp.DecodePixelWidth = decodePixels;
                }

                bmp.EndInit();
                bmp.Freeze();
                return bmp;
            }
            catch
            {
                return null;
            }
        }
    }
}
