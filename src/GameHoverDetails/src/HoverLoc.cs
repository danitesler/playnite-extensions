using System.Globalization;
using System.Reflection;
using System.Windows;
using Playnite.SDK;
using PlayniteExtensions;

namespace GameHoverDetails
{
    internal static class HoverLoc
    {
        public static string Empty => PlayniteLoc.Get("LOCGameHoverDetails_Value_Empty", "—");

        /// <summary>
        /// Playnite UI direction: language setting, then main window, then OS UI culture.
        /// Popups do not inherit <see cref="Window.FlowDirection"/>.
        /// </summary>
        public static FlowDirection LayoutFlow(IPlayniteAPI api = null, DependencyObject visual = null)
        {
            return IsRightToLeftLayout(api, visual) ? FlowDirection.RightToLeft : FlowDirection.LeftToRight;
        }

        public static bool IsRightToLeftLayout(IPlayniteAPI api = null, DependencyObject visual = null)
        {
            if (LanguageCodeIsRtl(TryGetPlayniteLanguage(api)))
            {
                return true;
            }

            var window = visual as Window ?? (visual != null ? Window.GetWindow(visual) : null) ?? Application.Current?.MainWindow;
            if (window != null && window.FlowDirection == FlowDirection.RightToLeft)
            {
                return true;
            }

            return CultureInfo.CurrentUICulture.TextInfo.IsRightToLeft
                || CultureInfo.CurrentCulture.TextInfo.IsRightToLeft;
        }

        private static string TryGetPlayniteLanguage(IPlayniteAPI api)
        {
            try
            {
                var settings = api?.ApplicationSettings;
                if (settings == null)
                {
                    return null;
                }

                var prop = settings.GetType().GetProperty("Language", BindingFlags.Instance | BindingFlags.Public);
                return prop?.GetValue(settings, null) as string;
            }
            catch
            {
                return null;
            }
        }

        internal static bool LanguageCodeIsRtl(string language)
        {
            if (string.IsNullOrWhiteSpace(language))
            {
                return false;
            }

            var normalized = language.Trim().Replace('_', '-');
            try
            {
                return CultureInfo.GetCultureInfo(normalized).TextInfo.IsRightToLeft;
            }
            catch (CultureNotFoundException)
            {
                var head = normalized.Split('-')[0].ToLowerInvariant();
                return head == "he" || head == "iw" || head == "ar" || head == "fa" || head == "ur";
            }
        }
    }
}
