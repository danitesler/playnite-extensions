#!/usr/bin/env python3
"""Questlog: writes src/Views/DetailsViewGameOverview.xaml and src/Views/GridViewGameOverview.xaml.

Both views share one page (banner, title and actions, info panels, details panel, empty state), so they are
generated from one description instead of being kept in step by hand.

    python art/overview.py

Change the page here, never in the two XAML files.
"""
from pathlib import Path
from subprocess import PIPE, run

VIEWS = Path(__file__).resolve().parent.parent / "src" / "Views"

# (group name, [(field, label key, kind, part name)]); order and names follow src/themes/AGENTS.md -> Metadata pane.
GROUPS = [
    ("MetaProgress", [
        ("CompletionStatus", "LOCCompletionStatus", "button", "PART_ButtonCompletionStatus"),
        ("PlayTime", "LOCTimePlayed", "text", "PART_TextPlayTime"),
        ("LastPlayed", "LOCLastPlayed", "text", "PART_TextLastActivity"),
        ("RecentActivity", "LOCRecentActivityLabel", "text", "PART_TextRecentActivity"),
        ("Added", "LOCDateAddedLabel", "text", "PART_TextAdded"),
    ]),
    ("MetaScores", [
        ("CommunityScore", "LOCCommunityScore", "score", "PART_TextCommunityScore"),
        ("CriticScore", "LOCCriticScore", "score", "PART_TextCriticScore"),
        ("UserScore", "LOCUserScore", "score", "PART_TextUserScore"),
    ]),
    ("MetaAbout", [
        ("Developers", "LOCDevelopersLabel", "items", "PART_ItemsDevelopers"),
        ("Publishers", "LOCPublishersLabel", "items", "PART_ItemsPublishers"),
        ("ReleaseDate", "LOCGameReleaseDateTitle", "button", "PART_ButtonReleaseDate"),
        ("Series", "LOCSeriesLabel", "items", "PART_ItemsSeries"),
        ("AgeRating", "LOCAgeRatingLabel", "items", "PART_ItemsAgeRatings"),
        ("Region", "LOCRegionLabel", "items", "PART_ItemsRegions"),
    ]),
    ("MetaTags", [
        ("Platform", "LOCPlatformsTitle", "chips", "PART_ItemsPlatforms"),
        ("Genres", "LOCGenresLabel", "chips", "PART_ItemsGenres"),
        ("Categories", "LOCCategoriesLabel", "chips", "PART_ItemsCategories"),
        ("Features", "LOCFeaturesLabel", "chips", "PART_ItemsFeatures"),
        ("Tags", "LOCTagsLabel", "chips", "PART_ItemsTags"),
    ]),
    ("MetaLibrary", [
        ("Library", "LOCGameProviderTitle", "button", "PART_ButtonLibrary"),
        ("Source", "LOCSourceLabel", "button", "PART_ButtonSource"),
        ("Version", "LOCVersionLabel", "button", "PART_ButtonVersion"),
        ("InstallSize", "LOCInstallSizeLabel", "text", "PART_TextInstallSize"),
        ("InstallDirectory", "LOCGameInstallDirTitle", "button", "PART_ButtonInstallDirectory"),
    ]),
    ("MetaLinks", [
        ("Links", "LOCLinksLabel", "items", "PART_ItemsLinks"),
    ]),
]

NO_GAME = '{Binding Game, FallbackValue={x:Null}}'


def indent(text, n):
    pad = " " * n
    return "\n".join((pad + line) if line.strip() else line for line in text.strip("\n").split("\n"))


def value(kind, part):
    if kind == "button":
        return f'<Button Grid.Column="1" x:Name="{part}" HorizontalAlignment="Left" Style="{{StaticResource PropertyItemButton}}" />'
    if kind == "text":
        return f'<TextBlock Grid.Column="1" x:Name="{part}" Style="{{DynamicResource BaseTextBlockStyle}}" TextWrapping="Wrap" />'
    if kind == "score":
        return f'<TextBlock Grid.Column="1" x:Name="{part}" Style="{{DynamicResource TextBlockGameScore}}" />'
    if kind == "items":
        return f'<ItemsControl Grid.Column="1" x:Name="{part}" />'
    if kind == "chips":
        return f'''<ItemsControl Grid.Column="1" x:Name="{part}" Tag="Chip" Margin="0,0,0,-5">
    <ItemsControl.ItemsPanel>
        <ItemsPanelTemplate>
            <WrapPanel />
        </ItemsPanelTemplate>
    </ItemsControl.ItemsPanel>
</ItemsControl>'''
    raise ValueError(kind)


def field(name, label, kind, part, grid):
    # Details view: a 132px gold caption column beside the value, so "Completion Status" stays on one line. Grid panel: proportional 2:3 columns, 12px gap.
    if grid:
        cols = '<ColumnDefinition Width="2*" />\n        <ColumnDefinition Width="3*" />'
        gap = "12"
    else:
        cols = '<ColumnDefinition Width="132" />\n        <ColumnDefinition Width="*" />'
        gap = "8"
    return f'''<Grid x:Name="PART_Elem{name}" Margin="0,6,0,6">
    <Grid.ColumnDefinitions>
        {cols}
    </Grid.ColumnDefinitions>
    <TextBlock Text="{{DynamicResource {label}}}" Style="{{DynamicResource BaseTextBlockStyle}}" Foreground="{{DynamicResource GlyphBrush}}" TextWrapping="Wrap" Margin="0,0,{gap},0" />
{indent(value(kind, part), 4)}
</Grid>'''


def group(name, fields, grid):
    conds = "\n".join(
        f'<Condition Binding="{{Binding Visibility, ElementName=PART_Elem{f[0]}}}" Value="Collapsed" />' for f in fields)
    if len(fields) == 1:
        trigger = f'''<DataTrigger Binding="{{Binding Visibility, ElementName=PART_Elem{fields[0][0]}}}" Value="Collapsed">
    <Setter Property="Visibility" Value="Collapsed" />
</DataTrigger>'''
    else:
        trigger = f'''<MultiDataTrigger>
    <MultiDataTrigger.Conditions>
{indent(conds, 8)}
    </MultiDataTrigger.Conditions>
    <Setter Property="Visibility" Value="Collapsed" />
</MultiDataTrigger>'''
    rows = "\n".join(field(*f, grid) for f in fields)
    return f'''<Border x:Name="{name}" Margin="0,0,0,14">
    <Border.Style>
        <Style TargetType="Border" BasedOn="{{StaticResource {{x:Type Border}}}}">
            <Style.Triggers>
{indent(trigger, 16)}
            </Style.Triggers>
        </Style>
    </Border.Style>
    <StackPanel>
{indent(rows, 8)}
    </StackPanel>
</Border>'''


def heading(key):
    """A panel heading: gold, like the names on the client's info panels, over a faint rule."""
    return f'''<TextBlock Text="{{DynamicResource {key}}}" FontSize="{{DynamicResource FontSizeLarger}}" FontFamily="{{DynamicResource HeadingFontFamily}}" FontWeight="SemiBold"
           Style="{{DynamicResource BaseTextBlockStyle}}" Foreground="{{DynamicResource GlyphBrush}}" />
<Rectangle Height="1" Margin="0,6,0,10" IsHitTestVisible="False" Opacity="0.3" Fill="{{DynamicResource PopupBorderBrush}}" />'''


def panel(inner, attrs="", name="", style="", padding="18,14,18,16"):
    """An info panel: the tooltip backdrop inside a metal line with a black line inside it."""
    n = f' x:Name="{name}"' if name else ""
    st = f"\n{indent(style, 4)}" if style else ""
    return f'''<Border{n}{attrs} SnapsToDevicePixels="True"
        Background="{{DynamicResource TooltipBackgroundBrush}}"
        BorderBrush="{{DynamicResource PopupBorderBrush}}"
        BorderThickness="{{DynamicResource PopupBorderThickness}}"
        CornerRadius="{{DynamicResource CornerRadiusLarge}}">{st}
    <Border BorderBrush="{{DynamicResource FrameInnerBrush}}" BorderThickness="1" Padding="{padding}"
            CornerRadius="{{DynamicResource ControlCornerRadius}}">
{indent(inner, 8)}
    </Border>
</Border>'''


def details_panel(grid, attrs):
    width = "GridDetailsPaneWidth" if grid else "GameDetailsPaneWidth"
    groups = "\n".join(group(n, f, grid) for n, f in GROUPS)
    inner = f'''<StackPanel Width="{{DynamicResource {width}}}">
{indent(heading("LOCGameDetails"), 4)}
    <StackPanel Margin="0,-6,0,-20">
{indent(groups, 8)}
    </StackPanel>
</StackPanel>'''
    return panel(inner, attrs, padding="14,12,14,14")


SHOTS_STYLE = '''<Grid.Style>
    <Style TargetType="Grid">
        <Setter Property="Visibility" Value="Collapsed" />
        <Style.Triggers>
            <DataTrigger Binding="{PluginSettings Plugin=SteamScreenshots, Path=IsControlVisible, FallbackValue=PluginUnavailable}" Value="True">
                <Setter Property="Visibility" Value="Visible" />
            </DataTrigger>
            <!-- The plugin hides its control and clears IsControlVisible on every game change, then needs about a second before the screenshots are in. Show the section (skeleton) for Steam library or Steam source games in that gap; give up after 12s so a game without screenshots does not keep an empty block. When the plugin is not installed or is disabled the binding fails, FallbackValue=PluginUnavailable matches neither True nor False, and no skeleton shows. -->
            <MultiDataTrigger>
                <MultiDataTrigger.Conditions>
                    <Condition Binding="{PluginSettings Plugin=SteamScreenshots, Path=IsControlVisible, FallbackValue=PluginUnavailable}" Value="False" />
                    <Condition Binding="{Binding Game.PluginId}" Value="cb91dfc9-b977-43bf-8e70-55f46e410fab" />
                </MultiDataTrigger.Conditions>
                <MultiDataTrigger.EnterActions>
                    <BeginStoryboard x:Name="SteamScreenshotsLoading">
                        <Storyboard>
                            <ObjectAnimationUsingKeyFrames Storyboard.TargetProperty="Visibility" Duration="0:0:12">
                                <DiscreteObjectKeyFrame KeyTime="0:0:0" Value="{x:Static Visibility.Visible}" />
                                <DiscreteObjectKeyFrame KeyTime="0:0:12" Value="{x:Static Visibility.Collapsed}" />
                            </ObjectAnimationUsingKeyFrames>
                        </Storyboard>
                    </BeginStoryboard>
                </MultiDataTrigger.EnterActions>
                <MultiDataTrigger.ExitActions>
                    <RemoveStoryboard BeginStoryboardName="SteamScreenshotsLoading" />
                </MultiDataTrigger.ExitActions>
            </MultiDataTrigger>
            <MultiDataTrigger>
                <MultiDataTrigger.Conditions>
                    <Condition Binding="{PluginSettings Plugin=SteamScreenshots, Path=IsControlVisible, FallbackValue=PluginUnavailable}" Value="False" />
                    <Condition Binding="{Binding Game.Source}" Value="Steam" />
                </MultiDataTrigger.Conditions>
                <MultiDataTrigger.EnterActions>
                    <BeginStoryboard x:Name="SteamScreenshotsLoadingSource">
                        <Storyboard>
                            <ObjectAnimationUsingKeyFrames Storyboard.TargetProperty="Visibility" Duration="0:0:12">
                                <DiscreteObjectKeyFrame KeyTime="0:0:0" Value="{x:Static Visibility.Visible}" />
                                <DiscreteObjectKeyFrame KeyTime="0:0:12" Value="{x:Static Visibility.Collapsed}" />
                            </ObjectAnimationUsingKeyFrames>
                        </Storyboard>
                    </BeginStoryboard>
                </MultiDataTrigger.EnterActions>
                <MultiDataTrigger.ExitActions>
                    <RemoveStoryboard BeginStoryboardName="SteamScreenshotsLoadingSource" />
                </MultiDataTrigger.ExitActions>
            </MultiDataTrigger>
        </Style.Triggers>
    </Style>
</Grid.Style>'''


def text_column(attrs):
    """Left column: screenshots and description in one info panel, the notes as a letter on paper under it."""
    shots = f'''<Grid x:Name="SteamScreenshotsGameScope">
    <!-- Plugin visibility is shared: a late Steam load must never reveal a different game's section. -->
    <Grid.Style>
        <Style TargetType="Grid">
            <Setter Property="Visibility" Value="Collapsed" />
            <Style.Triggers>
                <DataTrigger Binding="{{Binding Game.PluginId}}" Value="cb91dfc9-b977-43bf-8e70-55f46e410fab">
                    <Setter Property="Visibility" Value="Visible" />
                </DataTrigger>
                <DataTrigger Binding="{{Binding Game.Source.Name}}" Value="Steam">
                    <Setter Property="Visibility" Value="Visible" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Grid.Style>
<Grid x:Name="ShotsHost">
{indent(SHOTS_STYLE, 4)}
    <StackPanel Margin="0,0,0,18">
{indent(heading("LOC_SteamScreenshots_SteamScreenshotsLabel"), 8)}
        <Grid>
            <ContentControl x:Name="SteamScreenshots_SteamScreenshotsViewControl" />
            <Control Template="{{DynamicResource SteamScreenshotsSkeletonTemplate}}" Foreground="{{DynamicResource TextBrush}}" Focusable="False" IsTabStop="False" IsHitTestVisible="False">
                <Control.Style>
                    <Style TargetType="Control">
                        <Setter Property="Visibility" Value="Collapsed" />
                        <Style.Triggers>
                            <DataTrigger Binding="{{PluginSettings Plugin=SteamScreenshots, Path=IsControlVisible, FallbackValue=PluginUnavailable}}" Value="False">
                                <Setter Property="Visibility" Value="Visible" />
                            </DataTrigger>
                        </Style.Triggers>
                    </Style>
                </Control.Style>
            </Control>
        </Grid>
    </StackPanel>
</Grid>
</Grid>'''
    description = f'''<StackPanel Name="PART_ElemDescription">
{indent(heading("LOCGameDescriptionTitle"), 4)}
    <HtmlTextView Name="PART_HtmlDescription"
                  HtmlFontSize="{{DynamicResource FontSize}}"
                  HtmlFontFamily="{{DynamicResource FontFamily}}"
                  ScrollViewer.HorizontalScrollBarVisibility="Disabled"
                  ScrollViewer.VerticalScrollBarVisibility="Disabled"
                  pbeh:FocusBahaviors.BlockBringIntoViewRequest="True" />
</StackPanel>'''
    # The panel goes away when it has nothing to hold (no description and no screenshots).
    hide = '''<Border.Style>
    <Style TargetType="Border" BasedOn="{StaticResource {x:Type Border}}">
        <Style.Triggers>
            <MultiDataTrigger>
                <MultiDataTrigger.Conditions>
                    <Condition Binding="{Binding Visibility, ElementName=PART_ElemDescription}" Value="Collapsed" />
                    <Condition Binding="{Binding IsVisible, ElementName=ShotsHost}" Value="False" />
                </MultiDataTrigger.Conditions>
                <Setter Property="Visibility" Value="Collapsed" />
            </MultiDataTrigger>
        </Style.Triggers>
    </Style>
</Border.Style>'''
    info = panel(f'''<StackPanel>
{indent(shots, 4)}
{indent(description, 4)}
</StackPanel>''', name="TextPanel", style=hide)
    notes = '''<!-- Notes: a letter. Ink on the tiled paper with a shaded rim, in a black line. -->
<StackPanel Name="PART_ElemNotes" Margin="0,14,0,0">
    <Border SnapsToDevicePixels="True" BorderBrush="{DynamicResource FrameInnerBrush}" BorderThickness="1"
            Background="{DynamicResource ParchmentBrush}"
            CornerRadius="{DynamicResource CornerRadiusSmall}">
        <Grid>
            <Border IsHitTestVisible="False" Opacity="0.9">
                <Border.Background>
                    <ImageBrush ImageSource="{ThemeFile 'Images/parchment.png'}"
                                TileMode="Tile" Stretch="Fill"
                                ViewportUnits="Absolute" Viewport="0,0,256,256" />
                </Border.Background>
            </Border>
            <Border IsHitTestVisible="False" Background="{DynamicResource ParchmentEdgeBrush}">
                <Border.CacheMode>
                    <BitmapCache />
                </Border.CacheMode>
                <Border.OpacityMask>
                    <RadialGradientBrush RadiusX="0.75" RadiusY="0.75">
                        <GradientStop Color="Transparent" Offset="0.55" />
                        <GradientStop Color="#A0000000" Offset="1" />
                    </RadialGradientBrush>
                </Border.OpacityMask>
            </Border>
            <StackPanel Margin="18,12,18,16">
                <Grid Margin="0,0,0,4">
                    <TextBlock Text="{DynamicResource LOCNotesLabel}"
                               Margin="1,1,0,0" Opacity="0.65"
                               FontSize="{DynamicResource FontSizeLarger}" FontFamily="{DynamicResource HeadingFontFamily}" FontWeight="SemiBold"
                               Style="{DynamicResource BaseTextBlockStyle}"
                               Foreground="{DynamicResource ParchmentLabelBrush}" />
                    <TextBlock Text="{DynamicResource LOCNotesLabel}"
                               FontSize="{DynamicResource FontSizeLarger}" FontFamily="{DynamicResource HeadingFontFamily}" FontWeight="SemiBold"
                               Style="{DynamicResource BaseTextBlockStyle}"
                               Foreground="{DynamicResource ParchmentTitleBrush}" />
                </Grid>
                <TextBox Name="PART_TextNotes" IsReadOnly="True"
                         Style="{DynamicResource BareTextBox}"
                         Foreground="{DynamicResource ParchmentTextBrush}"
                         CaretBrush="{DynamicResource ParchmentTextBrush}"
                         AcceptsReturn="True" TextWrapping="Wrap"
                         Margin="0,4,0,0" Padding="0" />
            </StackPanel>
        </Grid>
    </Border>
</StackPanel>'''
    return f'''<StackPanel{attrs} VerticalAlignment="Top">
{indent(info, 4)}
{indent(notes, 4)}
</StackPanel>'''


HERO = '''<!-- Banner: the game's background art as a band at the top, GameBannerHeight high (0 turns it off). No OpacityMask
     here: masked art repainted in part behind the animated Play button leaves dark seams on scaled displays. A plain
     black scrim darkens it toward the title and a second gradient fades it into the page color, read from PageRoot. -->
<Grid x:Name="HeroArt" Height="{DynamicResource GameBannerHeight}" VerticalAlignment="Top" ClipToBounds="True" IsHitTestVisible="False">
    <Grid.Style>
        <Style TargetType="Grid">
            <Style.Triggers>
                <DataTrigger Binding="{Binding Source, ElementName=PART_ImageBackground}" Value="{x:Null}">
                    <Setter Property="Visibility" Value="Collapsed" />
                </DataTrigger>
                <DataTrigger Binding="{Binding Visibility, ElementName=PART_ImageBackground}" Value="Collapsed">
                    <Setter Property="Visibility" Value="Collapsed" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Grid.Style>
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill"
               HorizontalAlignment="Center" VerticalAlignment="Center" />
    <Rectangle>
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                <GradientStop Color="#59000000" Offset="0" />
                <GradientStop Color="#1F000000" Offset="0.22" />
                <GradientStop Color="#8C000000" Offset="0.6" />
                <GradientStop Color="#B3000000" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
    <Rectangle>
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                <GradientStop Color="#00000000" Offset="0.38" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
</Grid>'''


def spacer(default, off):
    return f'''<!-- Room above the title so it sits low on the banner; scales with the banner, gone when it is off or the game has no art. -->
<Border IsHitTestVisible="False">
    <Border.Style>
        <Style TargetType="Border">
            <Setter Property="Height" Value="{{Binding ActualHeight, ElementName=HeroArt, Converter={{StaticResource MathConverter}}, ConverterParameter='x * {default} / 320'}}" />
            <Style.Triggers>
                <DataTrigger Binding="{{Binding ActualHeight, ElementName=HeroArt}}" Value="0">
                    <Setter Property="Height" Value="{off}" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Border.Style>
</Border>'''


def slot(image, margin):
    """An image in an item slot: the bevelled slot edge round the black bed; hidden with the image."""
    name = image.split('"')[1]
    return f'''<Border{margin} VerticalAlignment="Center" SnapsToDevicePixels="True"
        Visibility="{{Binding Visibility, ElementName={name}}}"
        BorderBrush="{{DynamicResource SlotBorderBrush}}" BorderThickness="1"
        Background="{{DynamicResource GridItemBackgroundBrush}}"
        CornerRadius="{{DynamicResource ControlCornerRadius}}">
    {image}
</Border>'''


def title(extra=""):
    return f'''<TextBlock Name="PART_TextDisplayName" FontFamily="{{DynamicResource HeadingFontFamily}}"
           FontWeight="SemiBold" FontSize="{{DynamicResource FontSizeLargest}}"
           TextWrapping="Wrap" DockPanel.Dock="Left"{extra}
           VerticalAlignment="Center" Foreground="{{DynamicResource GlyphBrush}}">
    <TextBlock.Effect>
        <DropShadowEffect ShadowDepth="2" BlurRadius="0" Opacity="1" RenderingBias="Performance" />
    </TextBlock.Effect>
</TextBlock>'''


def icon_button(name, col, key, tip, focus=""):
    n = f'x:Name="{name}"' if name == "PART_ButtonEditGame" else f'Name="{name}"'
    return f'''<Button {n}{col}
        Width="40" Height="40" Padding="0" Margin="10,0,0,0"{focus}
        Style="{{DynamicResource SecondaryButton}}"
        ToolTip="{{DynamicResource {tip}}}">
    <ContentPresenter Width="20" Height="20"
                      Content="{{DynamicResource {key}}}"
                      ContentTemplate="{{DynamicResource IconTemplate}}" />
</Button>'''


EMPTY = f'''<!-- No game selected: an empty item slot holding the quest mark, under a slow gold glow, and Playnite's own line.
     Centred in the visible area. The glow loops only while this shows, on Opacity (a plain property). -->
<Grid x:Name="EmptyState" VerticalAlignment="Top" Height="{{Binding ViewportHeight, ElementName=PART_ScrollViewHost}}">
    <Grid.Style>
        <Style TargetType="Grid">
            <Setter Property="Visibility" Value="Collapsed" />
            <Style.Triggers>
                <DataTrigger Binding="{NO_GAME}" Value="{{x:Null}}">
                    <Setter Property="Visibility" Value="Visible" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Grid.Style>
    <StackPanel HorizontalAlignment="Center" VerticalAlignment="Center" Margin="24">
        <Grid Width="72" Height="72" HorizontalAlignment="Center">
            <Rectangle Margin="-44" IsHitTestVisible="False" Fill="{{DynamicResource GlyphBrush}}">
                <Rectangle.OpacityMask>
                    <ImageBrush ImageSource="{{ThemeFile 'Images/fx/glow-spot.png'}}" Stretch="Fill" />
                </Rectangle.OpacityMask>
                <Rectangle.Style>
                    <Style TargetType="Rectangle">
                        <Setter Property="Opacity" Value="0.22" />
                        <Style.Triggers>
                            <DataTrigger Binding="{NO_GAME}" Value="{{x:Null}}">
                                <DataTrigger.EnterActions>
                                    <BeginStoryboard x:Name="EmptyGlowPulse">
                                        <Storyboard RepeatBehavior="Forever" AutoReverse="True">
                                            <DoubleAnimation Storyboard.TargetProperty="Opacity" From="0.14" To="0.42" Duration="0:0:2.2">
                                                <DoubleAnimation.EasingFunction>
                                                    <SineEase EasingMode="EaseInOut" />
                                                </DoubleAnimation.EasingFunction>
                                            </DoubleAnimation>
                                        </Storyboard>
                                    </BeginStoryboard>
                                </DataTrigger.EnterActions>
                                <DataTrigger.ExitActions>
                                    <RemoveStoryboard BeginStoryboardName="EmptyGlowPulse" />
                                </DataTrigger.ExitActions>
                            </DataTrigger>
                        </Style.Triggers>
                    </Style>
                </Rectangle.Style>
            </Rectangle>
            <Border Background="{{DynamicResource GridItemBackgroundBrush}}"
                    BorderBrush="{{DynamicResource SlotBorderBrush}}" BorderThickness="2"
                    CornerRadius="{{DynamicResource CornerRadiusLarge}}" />
            <Border Margin="3" BorderBrush="{{DynamicResource FrameInnerBrush}}" BorderThickness="1"
                    CornerRadius="{{DynamicResource ControlCornerRadius}}" />
            <ContentPresenter Width="40" Height="40" HorizontalAlignment="Center" VerticalAlignment="Center"
                              TextElement.Foreground="{{DynamicResource GlyphBrush}}"
                              Content="{{DynamicResource IconUpdate}}"
                              ContentTemplate="{{DynamicResource IconTemplate}}" />
        </Grid>
        <TextBlock Text="{{DynamicResource LOCErrorNoGameSelected}}" Margin="0,22,0,0"
                   HorizontalAlignment="Center" TextAlignment="Center" TextWrapping="Wrap"
                   FontSize="{{DynamicResource FontSizeLarge}}"
                   Style="{{DynamicResource BaseTextBlockStyle}}"
                   Foreground="{{DynamicResource GlyphBrush}}" />
    </StackPanel>
</Grid>'''

CONTENT_STYLE = f'''<Grid.Style>
    <Style TargetType="Grid">
        <Style.Triggers>
            <DataTrigger Binding="{NO_GAME}" Value="{{x:Null}}">
                <Setter Property="Visibility" Value="Collapsed" />
            </DataTrigger>
        </Style.Triggers>
    </Style>
</Grid.Style>'''

HEAD = '''<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
                    xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
                    xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
                    xmlns:pbeh="clr-namespace:Playnite.Behaviors;assembly=Playnite"
                    mc:Ignorable="d">
'''

PAGE_NOTES = '''      - Title: gold capitals (HeadingFontFamily) with a two pixel shadow. Icon and cover sit in item slots.
      - Actions: Play is the big red panel button (DerivedStyles/PlayButton.xaml); More and Edit are 40x40 charcoal
        plates with gold glyphs (SecondaryButton), each with a tooltip.
      - Left: Steam screenshots and the description in one info panel, the client's tooltip frame (near-black
        backdrop inside a metal line with a black line inside it), gold headings, white text drawn by
        DescriptionView.html. The notes are a letter under it: ink on tiled paper.
      - Right: the details panel, the same frame: gold captions, white values, scores in the item quality colors,
        tags as small slots. Every metadata field, in the six shared groups, split by space; a group goes away
        with its last visible field.
      - No game selected: an empty slot with the quest mark under a slow gold glow.
    Generated by art/overview.py; change the page there.'''


def details_view():
    header = f'''<!-- Title, icon, cover and the action buttons -->
<DockPanel Margin="0,24,0,20" MaxWidth="1024" Grid.Row="1" Background="Transparent">
{indent(slot('<Image Name="PART_ImageCover" Height="{Settings GameDetailsCoverHeight}" StretchDirection="Both" Stretch="Uniform" RenderOptions.BitmapScalingMode="Fant" />', ' DockPanel.Dock="Right"').replace('VerticalAlignment="Center"', 'VerticalAlignment="Bottom"'), 4)}
    <StackPanel VerticalAlignment="Bottom" DockPanel.Dock="Left">
        <DockPanel>
{indent(slot('<Image Name="PART_ImageIcon" MaxHeight="48" MaxWidth="48" VerticalAlignment="Center" RenderOptions.BitmapScalingMode="Fant" />', ' DockPanel.Dock="Left" Margin="0,0,12,0"'), 12)}
{indent(title(' Margin="0,0,10,0"'), 12)}
        </DockPanel>
        <StackPanel HorizontalAlignment="Left" VerticalAlignment="Top"
                    Orientation="Horizontal" Margin="0,18,0,0">
            <Button Name="PART_ButtonPlayAction"
                    Width="150" Height="40" Style="{{DynamicResource PlayButton}}" />
            <Button Name="PART_ButtonContextAction"
                    Width="150" Height="40" />
{indent(icon_button("PART_ButtonMoreActions", "", "IconOptions", "LOCMoreAction"), 12)}
{indent(icon_button("PART_ButtonEditGame", "", "IconEdit", "LOCEditGame", ' Focusable="False"'), 12)}
        </StackPanel>
    </StackPanel>
</DockPanel>'''
    body = f'''<DockPanel MaxWidth="1024" Grid.Row="2">
{indent(details_panel(False, ' DockPanel.Dock="Right" Margin="20,0,0,20" VerticalAlignment="Top"'), 4)}
{indent(text_column(' Margin="0,0,0,20"'), 4)}
</DockPanel>'''
    page = f'''<Grid x:Name="PageRoot" Background="{{DynamicResource ContentBackgroundBrush}}">
    <!-- Visibility is set here on purpose: the inherited DetailsScrollViewer style collapses the host on a null
         DataContext, which would hide the empty state too. -->
    <ScrollViewer HorizontalScrollBarVisibility="Disabled"
                  VerticalScrollBarVisibility="Auto"
                  Style="{{DynamicResource DetailsScrollViewer}}" Visibility="Visible"
                  d:DesignWidth="1280"
                  d:DesignHeight="1280"
                  d:DataContext="{{x:Static DesignMainViewModel.DesignSelectedGameDetailsIntance}}"
                  x:Name="PART_ScrollViewHost">
        <Grid>
{indent(EMPTY, 12)}
            <Grid x:Name="GameContent">
{indent(CONTENT_STYLE, 16)}
{indent(HERO, 16)}
                <Grid HorizontalAlignment="Stretch" Margin="20,0,37,0">
                    <Grid.RowDefinitions>
                        <RowDefinition Height="Auto" />
                        <RowDefinition Height="Auto" />
                        <RowDefinition Height="*" />
                    </Grid.RowDefinitions>
{indent(grid_spacer(spacer(100, 0).replace('<Border IsHitTestVisible="False">', '<Border Grid.Row="0" IsHitTestVisible="False">'), 0, 'DetailsBannerSpacer'), 20)}
{indent(header, 20)}
{indent(body, 20)}
                </Grid>
            </Grid>
        </Grid>
    </ScrollViewer>
</Grid>'''
    return f'''<!--
    Overlay on Playnite Default/Views/DetailsViewGameOverview.xaml: the game page of the details view.
    Playnite's arrangement is kept (background art as a banner, GameBannerHeight; the cover and title over it; the
    action buttons; text on the left, details on the right); every PART_ name is Playnite's.
{PAGE_NOTES}
-->
{HEAD}
    <Style TargetType="{{x:Type DetailsViewGameOverview}}">
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="{{x:Type DetailsViewGameOverview}}">
{indent(page, 20)}
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
'''


CLOSE = '''<Button x:Name="SidePanelCloseButton" Tag="{DynamicResource GameBannerHeight}"
       
        HorizontalAlignment="Left" VerticalAlignment="Top" Margin="12,12,0,0" Width="28" Height="28" Padding="0"
        Focusable="False" Cursor="Hand" ToolTip="{DynamicResource LOCCloseLabel}"
        Command="{MainViewModel CloseGameSideBarCommand}">
<Button.Style><Style TargetType="Button" BasedOn="{StaticResource {x:Type Button}}">
    <Setter Property="Visibility" Value="{Binding Tag, RelativeSource={RelativeSource Self}, Converter={StaticResource MathConverter}, ConverterParameter='x &lt; 120 ? `Collapsed` : `Visible`'}" />
    <Style.Triggers><DataTrigger Binding="{Binding Game, FallbackValue={x:Null}}" Value="{x:Null}"><Setter Property="Visibility" Value="Visible" /></DataTrigger></Style.Triggers>
</Style></Button.Style>
    <!-- Close: a 28x28 plate that reads at rest (the theme's red button plate, a rim and a bright glyph) and turns the danger color on hover. -->
    <Button.Template>
        <ControlTemplate TargetType="{x:Type Button}">
            <Grid Background="Transparent">
                <Border CornerRadius="{DynamicResource ControlCornerRadius}" Background="{DynamicResource ButtonBackgroundBrush}"
                        BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="1" IsHitTestVisible="False" />
                <Border x:Name="HoverPlate" CornerRadius="{DynamicResource ControlCornerRadius}" Background="{DynamicResource DangerBrush}" Opacity="0" IsHitTestVisible="False" />
                <ContentControl x:Name="Glyph" Width="14" Height="14" HorizontalAlignment="Center" VerticalAlignment="Center" IsHitTestVisible="False"
                                Content="{DynamicResource IconWindowClose}" ContentTemplate="{DynamicResource IconTemplate}"
                                Foreground="{DynamicResource TextBrush}" />
            </Grid>
            <ControlTemplate.Triggers>
                <Trigger Property="IsMouseOver" Value="True">
                    <Setter TargetName="Glyph" Property="Foreground" Value="{DynamicResource DangerForegroundBrush}" />
                    <Trigger.EnterActions>
                        <BeginStoryboard><Storyboard>
                            <DoubleAnimation Storyboard.TargetName="HoverPlate" Storyboard.TargetProperty="Opacity" To="1" Duration="0:0:0.12" />
                        </Storyboard></BeginStoryboard>
                    </Trigger.EnterActions>
                    <Trigger.ExitActions>
                        <BeginStoryboard><Storyboard>
                            <DoubleAnimation FillBehavior="Stop" Storyboard.TargetName="HoverPlate" Storyboard.TargetProperty="Opacity" To="0" Duration="0:0:0.15" />
                        </Storyboard></BeginStoryboard>
                    </Trigger.ExitActions>
                </Trigger>
                <Trigger Property="IsPressed" Value="True">
                    <Setter TargetName="HoverPlate" Property="Opacity" Value="0.7" />
                </Trigger>
            </ControlTemplate.Triggers>
        </ControlTemplate>
    </Button.Template>
</Button>'''


INLINE_CLOSE = '''<Button x:Name="InlineSidePanelCloseButton" DockPanel.Dock="Left" HorizontalAlignment="Left" VerticalAlignment="Center"
        Margin="0,0,10,0" Width="28" Height="28" Padding="0" Focusable="False" Cursor="Hand"
        ToolTip="{DynamicResource LOCCloseLabel}" Command="{MainViewModel CloseGameSideBarCommand}"
        Template="{Binding Template, ElementName=SidePanelCloseButton}"
        Visibility="{Binding Tag, ElementName=SidePanelCloseButton, Converter={StaticResource MathConverter}, ConverterParameter='x &lt; 120 ? `Visible` : `Collapsed`'}">
            <Button.RenderTransform>
                <TranslateTransform Y="{Binding ContentVerticalOffset, ElementName=PART_ScrollViewHost}" />
            </Button.RenderTransform>
    </Button>'''


def grid_spacer(markup, floor, name='GridBannerSpacer'):
    import re
    markup = markup.replace('<Border', '<Border x:Name="' + name + '" MinHeight="' + str(floor) + '"', 1)
    markup = re.sub(r'(<Setter Property="Height" Value=")(\d+)(" />)', lambda m: m[1] + str(floor) + m[3], markup)
    return markup.replace('</Style.Triggers>', '''<DataTrigger Binding="{Binding Visibility, ElementName=HeroArt}" Value="Collapsed"><Setter Property="Height" Value="$FLOOR" /></DataTrigger>
'''.replace('$FLOOR', str(floor)) + '</Style.Triggers>')


# Grid-only layout: retain each pane's markup while allowing metadata to move below it.
def responsive_body(main, metadata, gap=24, attrs=''):
    import re
    def unposition(text, role):
        def root(match):
            tag = re.sub(r'\s(?:Grid\.Column|Grid\.Row|DockPanel\.Dock)="[^"]*"', '', match[0])
            def margin(m):
                values = m[1].split(',')
                if len(values) == 4: values[0 if role == 'Metadata' else 2] = '0'
                return 'Margin="' + ','.join(values) + '"'
            return re.sub(r'Margin="([^"]+)"', margin, tag)
        return re.sub(r'^<[^>]+>', root, text, count=1)
    def width(match):
        tag = match[1]
        return '<' + tag + match[2] + match[3] + ' x:Name="GridMetadataContent" MaxWidth="{DynamicResource GridDetailsPaneWidth}" Tag="{DynamicResource GridDetailsPaneWidth}">\n' + '''<$TAG.Style><Style TargetType="$TAG">
    <Setter Property="Width" Value="{DynamicResource GridDetailsPaneWidth}" />
    <Style.Triggers><DataTrigger Binding="{Binding Tag, ElementName=GridOverviewBody}" Value="True"><Setter Property="Width" Value="NaN" /></DataTrigger></Style.Triggers>
</Style></$TAG.Style>'''.replace('$TAG', tag)
    metadata = re.sub(r'<(\w+)([^>]*?)\sWidth="\{DynamicResource GridDetailsPaneWidth\}"([^>]*)>', width, unposition(metadata, 'Metadata'), count=1)
    main = unposition(main, 'Main')
    def column(role, content):
        return ('''<Grid x:Name="Grid$ROLEColumn" VerticalAlignment="Top">
<Grid.Style><Style TargetType="Grid">
    <Setter Property="Grid.Column" Value="$COL" /><Setter Property="Grid.Row" Value="0" /><Setter Property="Grid.ColumnSpan" Value="1" />
    $MARGIN
    <Style.Triggers><DataTrigger Binding="{Binding Tag, ElementName=GridOverviewBody}" Value="True">
        <Setter Property="Grid.Column" Value="0" /><Setter Property="Grid.Row" Value="$ROW" /><Setter Property="Grid.ColumnSpan" Value="2" />
        $NARROWMARGIN
    </DataTrigger></Style.Triggers>
</Style></Grid.Style>
$WIDTH
$CONTENT
</Grid>'''
            .replace('$ROLE', role).replace('$COL', '0' if role == 'Main' else '1').replace('$ROW', '0' if role == 'Main' else '1')
            .replace('$MARGIN', '<Setter Property="Margin" Value="' + str(gap) + ',0,0,0" />' if role == 'Metadata' else '')
            .replace('$NARROWMARGIN', '<Setter Property="Margin" Value="0,24,0,0" />' if role == 'Metadata' else '')
            .replace('$WIDTH', '''<Grid.MaxWidth><MultiBinding Converter="{StaticResource MathConverter}" ConverterParameter="z == true ? x : Max(0, x - y - $GAP)">
    <Binding Path="ActualWidth" ElementName="GridOverviewBody" /><Binding Path="ActualWidth" ElementName="GridMetadataColumn" /><Binding Path="Tag" ElementName="GridOverviewBody" />
</MultiBinding></Grid.MaxWidth>''' if role == 'Main' else '').replace('$CONTENT', content))
    return ('''<Grid x:Name="GridOverviewBody" $ATTRS>
<Grid.Tag><MultiBinding Converter="{StaticResource MathConverter}" ConverterParameter="x &lt; y + $GAP + 400">
    <Binding Path="ActualWidth" RelativeSource="{RelativeSource Self}" /><Binding Path="Tag" ElementName="GridMetadataContent" />
</MultiBinding></Grid.Tag>
<Grid.ColumnDefinitions><ColumnDefinition Width="*" /><ColumnDefinition Width="Auto" /></Grid.ColumnDefinitions>
<Grid.RowDefinitions><RowDefinition Height="Auto" /><RowDefinition Height="Auto" /></Grid.RowDefinitions>
$MAIN
$META
</Grid>'''.replace('$ATTRS', attrs).replace('$MAIN', column('Main', main))
        .replace('$META', column('Metadata', metadata)).replace('$GAP', str(gap)))


def grid_view():
    header = f'''<DockPanel Panel.ZIndex="2">
{indent(INLINE_CLOSE, 4)}
{indent(slot('<Image Name="PART_ImageIcon" MaxHeight="32" MaxWidth="32" RenderOptions.BitmapScalingMode="Fant" />', ' DockPanel.Dock="Left" Margin="0,0,10,0"'), 4)}
{indent(title(), 4)}
</DockPanel>
<Grid Margin="0,14,0,20" Background="Transparent">
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="*" MaxWidth="150" />
        <ColumnDefinition Width="Auto" />
        <ColumnDefinition Width="Auto" />
    </Grid.ColumnDefinitions>
    <Button Name="PART_ButtonPlayAction" Grid.Column="0"
            Height="40" Style="{{DynamicResource PlayButton}}" />
    <Button Name="PART_ButtonContextAction"
            Height="40" Grid.Column="0" />
{indent(icon_button("PART_ButtonMoreActions", ' Grid.Column="1"', "IconOptions", "LOCMoreAction"), 4)}
{indent(icon_button("PART_ButtonEditGame", ' Grid.Column="2"', "IconEdit", "LOCEditGame", ' Focusable="False"'), 4)}
</Grid>'''
    body = responsive_body(text_column(' Grid.Column="0" Margin="0,0,0,16"'),
        details_panel(True, ' Grid.Column="2" Margin="0,0,0,16" VerticalAlignment="Top"'), attrs='VerticalAlignment="Top"')
    page = f'''<Grid x:Name="PageRoot" Background="{{DynamicResource ContentBackgroundBrush}}"
      d:DataContext="{{x:Static DesignMainViewModel.DesignSelectedGameDetailsIntance}}">
    <ScrollViewer CanContentScroll="False" HorizontalAlignment="Stretch"
                  HorizontalScrollBarVisibility="Disabled" VerticalScrollBarVisibility="Auto"
                  x:Name="PART_ScrollViewHost">
        <Grid>
{indent(EMPTY, 12)}
            <!-- The header scrolls with the page (not pinned above it). -->
            <Grid x:Name="GameContent">
{indent(CONTENT_STYLE, 16)}
{indent(HERO, 16)}
                <StackPanel Margin="24,0,24,0">
{indent(grid_spacer(spacer(84, 24), 24), 20)}
{indent(header, 20)}
{indent(body, 20)}
                </StackPanel>
            </Grid>
        </Grid>
    </ScrollViewer>
{indent(CLOSE, 4)}
</Grid>'''
    return f'''<!--
    Overlay on Playnite Default/Views/GridViewGameOverview.xaml: the side panel of the grid view, set like the
    details view (Views/DetailsViewGameOverview.xaml). The close button is the frame's red plate, before the icon below 120px banner height and top left otherwise.
    Every PART_ name is Playnite's.
{PAGE_NOTES}
-->
{HEAD}
    <Style TargetType="{{x:Type GridViewGameOverview}}">
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="{{x:Type GridViewGameOverview}}">
{indent(page, 20)}
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
'''


def main():
    converter = Path(__file__).resolve().parents[4] / "scripts" / "game-page-breakpoints.mjs"
    pages = {"Details": details_view(), "Grid": grid_view()}
    responsive = {
        view: run(["node", str(converter), "--stdin", view], input=source,
                  stdout=PIPE, check=True, encoding="utf-8").stdout
        for view, source in pages.items()
    }
    VIEWS.mkdir(parents=True, exist_ok=True)
    for view, source in responsive.items():
        path = VIEWS / f"{view}ViewGameOverview.xaml"
        path.write_text(source, encoding="utf-8", newline="\n")
        print("wrote", path)


if __name__ == "__main__":
    main()
