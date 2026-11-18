using Playnite.SDK;
using PlayniteExtensions;

namespace RandomTheme
{
    internal static class RandomThemeLoc
    {
        /// <summary>"Desktop" / "Fullscreen" in the user's language.</summary>
        public static string ModeName(ApplicationMode mode) => mode == ApplicationMode.Fullscreen
            ? PlayniteLoc.Get("LOCRandomTheme_Fullscreen", "Fullscreen")
            : PlayniteLoc.Get("LOCRandomTheme_Desktop", "Desktop");
    }
}
