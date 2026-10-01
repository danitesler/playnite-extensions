"""Writes src/Views/DetailsViewGameOverview.xaml and src/Views/GridViewGameOverview.xaml.

Both game pages share the skeleton and the metadata pane described in src/themes/AGENTS.md > Game page; generating
them keeps the six groups, the field order and the collapse triggers identical in both files. Edit this script, not the
XAML, then run: python3 art/gamepage.py
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "src" / "Views"

# (group, [(field, label key, kind, part)])  kind: text, button, items, chips, score
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

GROUP_GAP = 12   # above and below each group rule
FIELD_GAP = 8    # above and below each field


def value(kind, part, col):
    c = f' Grid.Column="1"' if col else ""
    if kind == "text":
        return f'<TextBlock x:Name="{part}" Style="{{DynamicResource BaseTextBlockStyle}}" TextWrapping="Wrap"{c} />'
    if kind == "button":
        return f'<Button x:Name="{part}" HorizontalAlignment="Left" Style="{{StaticResource PropertyItemButton}}"{c} />'
    if kind == "score":
        return f'<TextBlock x:Name="{part}" Style="{{DynamicResource TextBlockGameScore}}" HorizontalAlignment="Left"{c} />'
    if kind == "items":
        return f'<ItemsControl x:Name="{part}"{c} />'
    return (f'<ItemsControl x:Name="{part}" Tag="Chip" Margin="0,2,0,-6"{c}>\n'
            f'    <ItemsControl.ItemsPanel>\n        <ItemsPanelTemplate>\n            <WrapPanel />\n'
            f'        </ItemsPanelTemplate>\n    </ItemsControl.ItemsPanel>\n</ItemsControl>')


def indent(text, n):
    pad = " " * n
    return "\n".join(pad + line if line else line for line in text.split("\n"))


def field(name, label, kind, part, beside):
    cap = (f'<TextBlock Text="{{DynamicResource {label}}}" Style="{{DynamicResource BaseTextBlockStyle}}" '
           f'Foreground="{{DynamicResource TextBrushDarker}}" TextWrapping="Wrap"')
    if beside:
        return (f'<Grid x:Name="PART_Elem{name}" Margin="0,{FIELD_GAP},0,{FIELD_GAP}">\n'
                f'    <Grid.ColumnDefinitions>\n        <ColumnDefinition Width="120" />\n        <ColumnDefinition Width="*" />\n'
                f'    </Grid.ColumnDefinitions>\n'
                f'    {cap} Margin="0,0,12,0" />\n'
                f'{indent(value(kind, part, True), 4)}\n'
                f'</Grid>')
    return (f'<StackPanel x:Name="PART_Elem{name}" Margin="0,{FIELD_GAP},0,{FIELD_GAP}">\n'
            f'    {cap} FontSize="{{DynamicResource FontSizeSmall}}" Margin="0,0,0,4" />\n'
            f'{indent(value(kind, part, False), 4)}\n'
            f'</StackPanel>')


def group(gname, fields, beside):
    if len(fields) == 1:
        trig = (f'<DataTrigger Binding="{{Binding Visibility, ElementName=PART_Elem{fields[0][0]}}}" Value="Collapsed">\n'
                f'    <Setter Property="Visibility" Value="Collapsed" />\n</DataTrigger>')
    else:
        conds = "\n".join(f'        <Condition Binding="{{Binding Visibility, ElementName=PART_Elem{f[0]}}}" Value="Collapsed" />' for f in fields)
        trig = (f'<MultiDataTrigger>\n    <MultiDataTrigger.Conditions>\n{conds}\n    </MultiDataTrigger.Conditions>\n'
                f'    <Setter Property="Visibility" Value="Collapsed" />\n</MultiDataTrigger>')
    body = "\n".join(field(*f, beside) for f in fields)
    return (f'<Border x:Name="{gname}" Margin="0,{GROUP_GAP},0,0" Padding="0,{GROUP_GAP},0,0" BorderThickness="0,1,0,0" '
            f'BorderBrush="{{DynamicResource WindowPanelSeparatorBrush}}">\n'
            f'    <Border.Style>\n        <Style TargetType="Border">\n            <Style.Triggers>\n'
            f'{indent(trig, 16)}\n            </Style.Triggers>\n        </Style>\n    </Border.Style>\n'
            f'    <StackPanel>\n{indent(body, 8)}\n    </StackPanel>\n</Border>')


def pane(beside):
    top = -(2 * GROUP_GAP + 1 + FIELD_GAP)
    groups = "\n".join(group(g, f, beside) for g, f in GROUPS)
    return (f'<!-- Metadata pane: one column of six groups split by hairlines (the first rule is clipped away). -->\n'
            f'<Border ClipToBounds="True">\n    <StackPanel Margin="0,{top},0,-{FIELD_GAP}">\n'
            f'{indent(groups, 8)}\n    </StackPanel>\n</Border>')


SECTION_TEMPLATE = """<ContentControl.ContentTemplate>
    <DataTemplate>
        <Border BorderThickness="0,0,0,1" BorderBrush="{DynamicResource WindowPanelSeparatorBrush}" Padding="0,0,0,8">
            <TextBlock Text="{Binding Converter={StaticResource StringToUpperCaseConverter}}" Style="{DynamicResource BaseTextBlockStyle}"
                       FontFamily="{DynamicResource HeadingFontFamily}" Foreground="{DynamicResource HeadingForegroundBrush}" />
        </Border>
    </DataTemplate>
</ContentControl.ContentTemplate>"""


def section(content_key):
    """A section caption (description, notes, screenshots): an uppercase word over a hairline, like the options list."""
    return (f'<ContentControl Content="{{DynamicResource {content_key}}}" Focusable="False" IsTabStop="False" Margin="0,0,0,12">\n'
            f'{indent(SECTION_TEMPLATE, 4)}\n</ContentControl>')


DESCRIPTION = '''<StackPanel x:Name="PART_ElemDescription" Margin="0,0,0,28">
''' + indent(section("LOCGameDescriptionTitle"), 4) + '''
    <HtmlTextView x:Name="PART_HtmlDescription"
                  TextElement.Foreground="{DynamicResource TextBrush}" Tag="{DynamicResource GlyphBrush}"
                  HtmlForeground="{Binding (TextElement.Foreground).Color, RelativeSource={RelativeSource Self}}"
                  LinkForeground="{Binding Tag.Color, RelativeSource={RelativeSource Self}}"
                  HtmlFontSize="{DynamicResource FontSize}"
                  HtmlFontFamily="{DynamicResource FontFamily}"
                  ScrollViewer.HorizontalScrollBarVisibility="Disabled"
                  ScrollViewer.VerticalScrollBarVisibility="Disabled"
                  pbeh:FocusBahaviors.BlockBringIntoViewRequest="True" />
</StackPanel>
<StackPanel x:Name="PART_ElemNotes" Margin="0,0,0,28">
''' + indent(section("LOCNotesLabel"), 4) + '''
    <TextBox x:Name="PART_TextNotes" IsReadOnly="True" BorderThickness="0" Background="Transparent"
             AcceptsReturn="True" TextWrapping="Wrap" Margin="-1,0,-1,0" Padding="0" />
</StackPanel>'''

STEAM = '''<Grid Margin="0,0,0,28">
    <Grid.Style>
        <Style TargetType="Grid">
            <Setter Property="Visibility" Value="Collapsed" />
            <Style.Triggers>
                <DataTrigger Binding="{PluginSettings Plugin=SteamScreenshots, Path=IsControlVisible, FallbackValue=PluginUnavailable}" Value="True">
                    <Setter Property="Visibility" Value="Visible" />
                </DataTrigger>
                <!-- The plugin hides its control and clears IsControlVisible on every game change, then needs about a second. Show the skeleton for Steam games in that gap, for at most 12s. With the plugin missing the binding falls back to PluginUnavailable, which matches neither True nor False. -->
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
            </Style.Triggers>
        </Style>
    </Grid.Style>
    <StackPanel>
''' + indent(section("LOC_SteamScreenshots_SteamScreenshotsLabel"), 8) + '''
        <Grid>
            <ContentControl x:Name="SteamScreenshots_SteamScreenshotsViewControl" />
            <Control Template="{DynamicResource SteamScreenshotsSkeletonTemplate}" Foreground="{DynamicResource TextBrushDarker}"
                     Focusable="False" IsTabStop="False" IsHitTestVisible="False">
                <Control.Style>
                    <Style TargetType="Control">
                        <Setter Property="Visibility" Value="Collapsed" />
                        <Style.Triggers>
                            <DataTrigger Binding="{PluginSettings Plugin=SteamScreenshots, Path=IsControlVisible, FallbackValue=PluginUnavailable}" Value="False">
                                <Setter Property="Visibility" Value="Visible" />
                            </DataTrigger>
                        </Style.Triggers>
                    </Style>
                </Control.Style>
            </Control>
        </Grid>
    </StackPanel>
</Grid>'''


def hero(spacer, banner=360):
    return '''<Grid x:Name="HeroArt" Height="{DynamicResource GameBannerHeight}" VerticalAlignment="Top" ClipToBounds="True" IsHitTestVisible="False">
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
    <Grid.CacheMode>
        <BitmapCache EnableClearType="False" RenderAtScale="1" SnapsToDevicePixels="False" />
    </Grid.CacheMode>
    <Grid.OpacityMask>
        <LinearGradientBrush StartPoint="0.5,0" EndPoint="0.5,1">
            <GradientStop Color="Black" Offset="0" />
            <GradientStop Color="Black" Offset="0.4" />
            <GradientStop Color="Transparent" Offset="1" />
        </LinearGradientBrush>
    </Grid.OpacityMask>
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill" HorizontalAlignment="Center" VerticalAlignment="Center" />
    <!-- The menus' scene treatment: darkened overall, darkest at the left where the words sit and toward the title. -->
    <Rectangle Fill="{DynamicResource ScrimBrush}" Opacity="0.35" />
    <Rectangle Fill="{DynamicResource ScrimBrush}">
        <Rectangle.OpacityMask>
            <LinearGradientBrush StartPoint="0,0" EndPoint="1,0">
                <GradientStop Color="#CC000000" Offset="0" />
                <GradientStop Color="#00000000" Offset="0.6" />
            </LinearGradientBrush>
        </Rectangle.OpacityMask>
    </Rectangle>
    <Rectangle Fill="{DynamicResource ScrimBrush}">
        <Rectangle.OpacityMask>
            <LinearGradientBrush StartPoint="0.5,0" EndPoint="0.5,1">
                <GradientStop Color="#00000000" Offset="0.3" />
                <GradientStop Color="#CC000000" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.OpacityMask>
    </Rectangle>
</Grid>''', f'''<Border IsHitTestVisible="False">
    <Border.Style>
        <Style TargetType="Border">
            <Setter Property="Height" Value="{{Binding ActualHeight, ElementName=HeroArt, Converter={{StaticResource MathConverter}}, ConverterParameter='x * {spacer} / {banner}'}}" />
            <Style.Triggers>
                <DataTrigger Binding="{{Binding ActualHeight, ElementName=HeroArt}}" Value="0">
                    <Setter Property="Height" Value="0" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Border.Style>
</Border>'''


TITLE = '''<TextBlock x:Name="PART_TextDisplayName" FontFamily="{DynamicResource HeadingFontFamily}" FontSize="38"
           Typography.Capitals="AllSmallCaps" TextWrapping="Wrap" VerticalAlignment="Center"
           Foreground="{DynamicResource SelectedForegroundBrush}" />'''


def actions(h):
    return f'''<Grid>
    <Button x:Name="PART_ButtonPlayAction" MinWidth="180" Height="{h}" Style="{{DynamicResource PlayButton}}" />
    <Button x:Name="PART_ButtonContextAction" MinWidth="180" Height="{h}" />
</Grid>
<Button x:Name="PART_ButtonMoreActions" Width="{h}" Height="{h}" Padding="0" Margin="8,0,0,0" ToolTip="{{DynamicResource LOCMoreAction}}">
    <ContentControl Width="18" Height="18" Focusable="False" IsTabStop="False"
                    Content="{{DynamicResource IconOptions}}" ContentTemplate="{{DynamicResource IconTemplate}}" />
</Button>
<Button x:Name="PART_ButtonEditGame" Width="{h}" Height="{h}" Padding="0" Margin="8,0,0,0" Focusable="False">
    <ContentControl Width="18" Height="18" Focusable="False" IsTabStop="False"
                    Content="{{DynamicResource IconEdit}}" ContentTemplate="{{DynamicResource IconTemplate}}" />
</Button>'''


XMLNS = '''<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
                    xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
                    xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
                    xmlns:pbeh="clr-namespace:Playnite.Behaviors;assembly=Playnite"
                    mc:Ignorable="d">'''


def details():
    art, spacer = hero(220)
    body = f'''<Grid Background="{{DynamicResource GameOverviewBackgroundBrush}}"
      d:DesignWidth="1280" d:DesignHeight="960"
      d:DataContext="{{x:Static DesignMainViewModel.DesignSelectedGameDetailsIntance}}">
    <ScrollViewer x:Name="PART_ScrollViewHost" HorizontalScrollBarVisibility="Disabled" VerticalScrollBarVisibility="Auto">
        <Grid>
{indent(art, 12)}
            <StackPanel Margin="40,0,40,40" MaxWidth="1400">
{indent(spacer, 16)}
                <!-- Header: icon and name, then the actions at the right. -->
                <DockPanel Margin="0,24,0,32">
                    <StackPanel Orientation="Horizontal" DockPanel.Dock="Right" VerticalAlignment="Center" Margin="24,0,0,0">
{indent(actions(44), 24)}
                    </StackPanel>
                    <Image x:Name="PART_ImageIcon" MaxHeight="40" MaxWidth="40" DockPanel.Dock="Left" Margin="0,0,16,0"
                           VerticalAlignment="Center" RenderOptions.BitmapScalingMode="Fant" />
{indent(TITLE, 20)}
                </DockPanel>
                <DockPanel>
                    <StackPanel DockPanel.Dock="Right" Width="{{DynamicResource GameDetailsPaneWidth}}" Margin="40,0,0,0">
                        <Image x:Name="PART_ImageCover" Height="{{Settings GameDetailsCoverHeight}}" HorizontalAlignment="Left"
                               StretchDirection="Both" Stretch="Uniform" Margin="0,0,0,20" RenderOptions.BitmapScalingMode="Fant" />
{indent(pane(True), 24)}
                    </StackPanel>
                    <StackPanel>
{indent(STEAM, 24)}
{indent(DESCRIPTION, 24)}
                    </StackPanel>
                </DockPanel>
            </StackPanel>
        </Grid>
    </ScrollViewer>
</Grid>'''
    head = '''<!--
    Overlay on Playnite Default/Views/DetailsViewGameOverview.xaml: the game page beside the game list.
    Laid out like the Resident Evil 4 (2023) pause and load screens: the background art as a darkened scene at the top
    (darkest at the left and toward the title), the name in the condensed face in small caps and warm white, the Play
    plate (the menus' pewter selection plate) with square More and Edit buttons beside it. Below, the description and
    notes under uppercase captions on hairlines, like the options list, and at the right the cover over one metadata
    pane: six groups split by hairlines, captions in the idle grey beside warm values.
    Generated by art/gamepage.py; edit the script, then rerun it. Every PART_ element of Playnite's file is kept.
    HtmlTextView takes Colors: HtmlForeground and LinkForeground read the Color of the brushes on TextElement.Foreground
    and Tag, so ThemeModifier edits reach them.
-->
'''
    return head + XMLNS + f'''

    <Style TargetType="{{x:Type DetailsViewGameOverview}}">
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="{{x:Type DetailsViewGameOverview}}">
{indent(body, 20)}
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
'''


def grid():
    art, spacer = hero(150)
    body = f'''<Border BorderBrush="{{DynamicResource PanelSeparatorBrush}}" Background="{{DynamicResource GameOverviewBackgroundBrush}}"
        d:DataContext="{{x:Static DesignMainViewModel.DesignSelectedGameDetailsIntance}}">
    <Border.Style>
        <Style TargetType="Border">
            <Setter Property="BorderThickness" Value="1,0,0,0" />
            <Style.Triggers>
                <DataTrigger Binding="{{Settings GridViewDetailsPosition}}" Value="Left">
                    <Setter Property="BorderThickness" Value="0,0,1,0" />
                </DataTrigger>
                <DataTrigger Binding="{{Settings ShowPanelSeparators}}" Value="False">
                    <Setter Property="BorderThickness" Value="0" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Border.Style>
    <Grid>
        <TextBlock Text="{{DynamicResource LOCErrorNoGameSelected}}" Margin="0,24,0,0" HorizontalAlignment="Center" VerticalAlignment="Top">
            <TextBlock.Style>
                <Style TargetType="TextBlock" BasedOn="{{StaticResource BaseTextBlockStyle}}">
                    <Setter Property="Visibility" Value="Collapsed" />
                    <Style.Triggers>
                        <Trigger Property="DataContext" Value="{{x:Null}}">
                            <Setter Property="Visibility" Value="Visible" />
                        </Trigger>
                    </Style.Triggers>
                </Style>
            </TextBlock.Style>
        </TextBlock>
        <ScrollViewer x:Name="PART_ScrollViewHost" HorizontalScrollBarVisibility="Disabled" VerticalScrollBarVisibility="Auto">
            <ScrollViewer.Style>
                <Style TargetType="ScrollViewer" BasedOn="{{StaticResource {{x:Type ScrollViewer}}}}">
                    <Style.Triggers>
                        <Trigger Property="DataContext" Value="{{x:Null}}">
                            <Setter Property="Visibility" Value="Collapsed" />
                        </Trigger>
                    </Style.Triggers>
                </Style>
            </ScrollViewer.Style>
            <Grid>
{indent(art, 16)}
                <StackPanel Margin="24,0,24,24">
{indent(spacer, 20)}
                    <DockPanel Margin="0,16,0,16">
                        <Image x:Name="PART_ImageIcon" MaxHeight="32" MaxWidth="32" DockPanel.Dock="Left" Margin="0,0,12,0"
                               VerticalAlignment="Center" RenderOptions.BitmapScalingMode="Fant" />
{indent(TITLE, 24)}
                    </DockPanel>
                    <StackPanel Orientation="Horizontal" Margin="0,0,0,28">
{indent(actions(40), 24)}
                    </StackPanel>
                    <DockPanel>
                        <StackPanel DockPanel.Dock="Right" Width="{{DynamicResource GridDetailsPaneWidth}}" Margin="24,0,0,0">
{indent(pane(False), 28)}
                        </StackPanel>
                        <StackPanel>
{indent(STEAM, 28)}
{indent(DESCRIPTION, 28)}
                        </StackPanel>
                    </DockPanel>
                </StackPanel>
            </Grid>
        </ScrollViewer>
        <Button HorizontalAlignment="Right" VerticalAlignment="Top" Margin="0,12,12,0" Width="32" Height="32" Padding="0"
                Command="{{MainViewModel CloseGameSideBarCommand}}" Background="{{DynamicResource PopupBackgroundBrush}}">
            <ContentControl Width="12" Height="12" Focusable="False" IsTabStop="False"
                            Content="{{DynamicResource IconWindowClose}}" ContentTemplate="{{DynamicResource IconTemplate}}" />
        </Button>
    </Grid>
</Border>'''
    head = '''<!--
    Overlay on Playnite Default/Views/GridViewGameOverview.xaml: the side panel of the grid view.
    The game page of DetailsViewGameOverview.xaml, narrowed: darkened scene banner, the name in small caps, the Play
    plate and square More and Edit buttons under it, then the description and notes beside one metadata pane whose
    captions sit above their values. A close button over the top right corner. Generated by art/gamepage.py.
    Every PART_ element of Playnite's file is kept.
-->
'''
    return head + XMLNS + f'''

    <Style TargetType="{{x:Type GridViewGameOverview}}">
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="{{x:Type GridViewGameOverview}}">
{indent(body, 20)}
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
'''


(ROOT / "DetailsViewGameOverview.xaml").write_text(details())
(ROOT / "GridViewGameOverview.xaml").write_text(grid())
print("wrote", ROOT / "DetailsViewGameOverview.xaml", ROOT / "GridViewGameOverview.xaml")
