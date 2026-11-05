using System;
using System.Collections.Generic;
using System.Linq;

namespace GameHoverDetails
{
    internal sealed class HoverFieldPreset
    {
        internal HoverFieldPreset(string id, params string[] fieldKeys)
        {
            Id = id;
            FieldKeys = Array.AsReadOnly(fieldKeys);
        }

        internal string Id { get; }
        internal IReadOnlyList<string> FieldKeys { get; }
    }

    internal static class HoverFieldPresets
    {
        internal static readonly IReadOnlyList<HoverFieldPreset> All = Array.AsReadOnly(new[]
        {
            new HoverFieldPreset("PlayTime", "TimePlayed", "LastPlayed", "CompletionStatus"),
            new HoverFieldPreset("Discover", "Genre", "ReleaseDate", "CommunityScore", "Description"),
            new HoverFieldPreset("Info", "Library", "Developer", "Genre", "ReleaseDate"),
            new HoverFieldPreset("AtAGlance", "Icon", "Genre", "CommunityScore", "TimePlayed", "CompletionStatus"),
            new HoverFieldPreset("Ratings", "CommunityScore", "CriticScore", "UserScore")
        });

        internal static string Match(IEnumerable<string> fieldKeys)
        {
            return All.FirstOrDefault(p => p.FieldKeys.SequenceEqual(fieldKeys))?.Id;
        }
    }
}
