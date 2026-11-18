namespace RandomTheme
{
    /// <summary>
    /// An installed Playnite theme.
    /// </summary>
    public sealed class ThemeInfo
    {
        public string Id { get; }
        public string Name { get; }

        public ThemeInfo(string id, string name)
        {
            Id = id;
            Name = name;
        }

        public override string ToString() => $"{Name} ({Id})";
    }
}
