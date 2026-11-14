"""Writes src/Views/DetailsViewGameOverview.xaml and src/Views/GridViewGameOverview.xaml.

Both views share the skeleton in src/themes/AGENTS.md (banner, header, Steam screenshots, two columns) and one
metadata pane of six groups. Generating them keeps the groups, part names and spacing identical in the two files.
Run from anywhere: python3 art/overview.py
"""
from pathlib import Path
from subprocess import PIPE, run

ROOT = Path(__file__).resolve().parent.parent / "src" / "Views"

# (group name, [(field, label key, value kind, part name)])
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

# Rhythm: 12px above and below each group rule, 8px above and below each field.
GROUP_GAP, FIELD_GAP = 12, 8


def value_xaml(kind, part, column):
    col = f'Grid.Column="1" ' if column else ""
    if kind == "button":
        return f'<Button {col}x:Name="{part}" HorizontalAlignment="Left" Style="{{StaticResource PropertyItemButton}}" />'
    if kind == "text":
        return f'<TextBlock {col}x:Name="{part}" Style="{{DynamicResource BaseTextBlockStyle}}" TextWrapping="Wrap" />'
    if kind == "score":
        return f'<TextBlock {col}x:Name="{part}" Style="{{DynamicResource TextBlockGameScore}}" HorizontalAlignment="Left" />'
    if kind == "items":
        return f'<ItemsControl {col}x:Name="{part}" />'
    return (f'<ItemsControl {col}x:Name="{part}" Tag="Chip" Margin="0,0,0,-6">\n'
            '    <ItemsControl.ItemsPanel>\n'
            '        <ItemsPanelTemplate>\n'
            '            <WrapPanel />\n'
            '        </ItemsPanelTemplate>\n'
            '    </ItemsControl.ItemsPanel>\n'
            '</ItemsControl>')


def indent(text, n):
    pad = " " * n
    return "\n".join(pad + line if line else line for line in text.splitlines())


def field_xaml(field, label, kind, part, beside):
    """Details use a fixed caption column; the narrower grid pane uses proportional columns."""
    if beside:
        return (f'<Grid x:Name="PART_Elem{field}" Margin="0,{FIELD_GAP},0,{FIELD_GAP}">\n'
                '    <Grid.ColumnDefinitions>\n'
                '        <ColumnDefinition Width="112" />\n'
                '        <ColumnDefinition Width="*" />\n'
                '    </Grid.ColumnDefinitions>\n'
                f'    <TextBlock Text="{{DynamicResource {label}}}" Style="{{DynamicResource HeadingTextBlock}}" FontSize="{{DynamicResource FontSize}}" TextWrapping="Wrap" Margin="0,0,12,0" />\n'
                + indent(value_xaml(kind, part, True), 4) + "\n"
                '</Grid>')
    grid_value = value_xaml(kind, part, True).replace('Grid.Column="1"', 'Grid.Column="2"')
    if kind == "score":
        grid_value = grid_value.replace(' />', ' TextWrapping="Wrap" />')
    return (f'<Grid x:Name="PART_Elem{field}" Margin="0,{FIELD_GAP},0,{FIELD_GAP}">\n'
            '    <Grid.ColumnDefinitions>\n'
            '        <ColumnDefinition Width="2*" />\n'
            '        <ColumnDefinition Width="12" />\n'
            '        <ColumnDefinition Width="3*" />\n'
            '    </Grid.ColumnDefinitions>\n'
            f'    <TextBlock Text="{{DynamicResource {label}}}" Style="{{DynamicResource HeadingTextBlock}}" FontSize="{{DynamicResource FontSizeSmall}}" TextWrapping="Wrap" VerticalAlignment="Top" />\n'
            + indent(grid_value, 4) + "\n"
            '</Grid>')


def group_xaml(name, fields, beside):
    if len(fields) == 1:
        trigger = (f'<DataTrigger Binding="{{Binding Visibility, ElementName=PART_Elem{fields[0][0]}}}" Value="Collapsed">\n'
                   '    <Setter Property="Visibility" Value="Collapsed" />\n'
                   '</DataTrigger>')
    else:
        conds = "\n".join(f'        <Condition Binding="{{Binding Visibility, ElementName=PART_Elem{f[0]}}}" Value="Collapsed" />'
                          for f in fields)
        trigger = ('<MultiDataTrigger>\n'
                   '    <MultiDataTrigger.Conditions>\n'
                   f'{conds}\n'
                   '    </MultiDataTrigger.Conditions>\n'
                   '    <Setter Property="Visibility" Value="Collapsed" />\n'
                   '</MultiDataTrigger>')
    body = "\n".join(field_xaml(*f, beside) for f in fields)
    return (f'<Border x:Name="{name}" Margin="0,{GROUP_GAP},0,0" Padding="0,{GROUP_GAP},0,0" BorderThickness="0,1,0,0" BorderBrush="{{DynamicResource MenuSeparatorBrush}}">\n'
            '    <Border.Style>\n'
            '        <Style TargetType="Border" BasedOn="{StaticResource {x:Type Border}}">\n'
            '            <Style.Triggers>\n'
            + indent(trigger, 16) + "\n"
            '            </Style.Triggers>\n'
            '        </Style>\n'
            '    </Border.Style>\n'
            '    <StackPanel>\n'
            + indent(body, 8) + "\n"
            '    </StackPanel>\n'
            '</Border>')


def pane_xaml(beside):
    top = -(2 * GROUP_GAP + 1 + FIELD_GAP)
    groups = "\n".join(group_xaml(n, f, beside) for n, f in GROUPS)
    # No card of its own: transparent with no edge, so the fields start flush
    # with the Game details caption; groups still split by 1px dark lines.
    return ('<Border Background="Transparent" BorderThickness="0" Padding="0,4,0,4">\n'
            '    <Border ClipToBounds="True">\n'
            f'        <StackPanel Margin="0,{top},0,-{FIELD_GAP}">\n'
            + indent(groups, 12) + "\n"
            '        </StackPanel>\n'
            '    </Border>\n'
            '</Border>')


def heading(text_key, top="0,0,0,0"):
    return (f'<TextBlock Text="{{DynamicResource {text_key}}}" Margin="{top}" Style="{{DynamicResource HeadingTextBlock}}" />\n'
            '<Control Template="{DynamicResource DividerTemplate}" Focusable="False" IsTabStop="False" IsHitTestVisible="False" Margin="0,8,0,12" />')


STEAM = '''<Grid x:Name="SteamScreenshotsGameScope">
    <!-- Plugin visibility is shared: a late Steam load must never reveal a different game's section. -->
    <Grid.Style>
        <Style TargetType="Grid">
            <Setter Property="Visibility" Value="Collapsed" />
            <Style.Triggers>
                <DataTrigger Binding="{Binding Game.PluginId}" Value="cb91dfc9-b977-43bf-8e70-55f46e410fab">
                    <Setter Property="Visibility" Value="Visible" />
                </DataTrigger>
                <DataTrigger Binding="{Binding Game.Source.Name}" Value="Steam">
                    <Setter Property="Visibility" Value="Visible" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Grid.Style>
<Grid>
    <Grid.Style>
        <Style TargetType="Grid">
            <Setter Property="Visibility" Value="Collapsed" />
            <Style.Triggers>
                <DataTrigger Binding="{PluginSettings Plugin=SteamScreenshots, Path=IsControlVisible, FallbackValue=PluginUnavailable}" Value="True">
                    <Setter Property="Visibility" Value="Visible" />
                </DataTrigger>
                <!-- The plugin hides its control and clears IsControlVisible on every game change, then needs about a second. Show the skeleton for Steam games in that gap, give up after 12s. With the plugin missing or disabled the binding falls back to PluginUnavailable, which matches neither value. -->
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
    </Grid.Style>
    <StackPanel Margin="0,0,0,24">
''' + indent(heading("LOC_SteamScreenshots_SteamScreenshotsLabel"), 8) + '''
        <Grid>
            <ContentControl x:Name="SteamScreenshots_SteamScreenshotsViewControl" />
            <Control Template="{DynamicResource SteamScreenshotsSkeletonTemplate}" Foreground="{DynamicResource TextBrushDarker}" Focusable="False" IsTabStop="False" IsHitTestVisible="False">
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
</Grid>
</Grid>'''

TEXT_COLUMN = STEAM + '''
<StackPanel Name="PART_ElemDescription" Margin="0,0,0,24">
''' + indent(heading("LOCGameDescriptionTitle"), 4) + '''
    <HtmlTextView Name="PART_HtmlDescription"
                  HtmlFontSize="{DynamicResource FontSize}"
                  HtmlFontFamily="{DynamicResource FontFamily}"
                  HtmlForeground="{DynamicResource TextColor}"
                  LinkForeground="{DynamicResource GlyphColor}"
                  ScrollViewer.HorizontalScrollBarVisibility="Disabled"
                  ScrollViewer.VerticalScrollBarVisibility="Disabled"
                  pbeh:FocusBahaviors.BlockBringIntoViewRequest="True" />
</StackPanel>
<StackPanel Name="PART_ElemNotes" Margin="0,0,0,16">
''' + indent(heading("LOCNotesLabel"), 4) + '''
    <TextBox Name="PART_TextNotes" IsReadOnly="True"
             BorderThickness="0" Background="Transparent"
             AcceptsReturn="True" TextWrapping="Wrap"
             Margin="-1,0,-1,0" Padding="0" />
</StackPanel>'''


def hero(brush, name="HeroArt"):
    return f'''<Grid x:Name="{name}" Height="{{DynamicResource GameBannerHeight}}" VerticalAlignment="Top" ClipToBounds="True" IsHitTestVisible="False">
    <Grid.Style>
        <Style TargetType="Grid">
            <Style.Triggers>
                <DataTrigger Binding="{{Binding Source, ElementName=PART_ImageBackground}}" Value="{{x:Null}}">
                    <Setter Property="Visibility" Value="Collapsed" />
                </DataTrigger>
                <DataTrigger Binding="{{Binding Visibility, ElementName=PART_ImageBackground}}" Value="Collapsed">
                    <Setter Property="Visibility" Value="Collapsed" />
                </DataTrigger>
                <DataTrigger Binding="{{Settings ShowBackgroundImageOnWindow}}" Value="True">
                    <Setter Property="Visibility" Value="Collapsed" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Grid.Style>
    <!-- No OpacityMask and no BitmapCache on the banner: masked art repainted in part (behind the animated PLAY button) left dark
         seams on scaled displays. The scrim, the side vignette and the fade into the page are plain gradients in the page brush;
         the fade stops at half strength, which is how far the library art under the page is veiled (Views/Library.xaml). -->
    <Border x:Name="LayerSwatch" Background="{{DynamicResource {brush}}}" Visibility="Collapsed" />
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill"
               HorizontalAlignment="Center" VerticalAlignment="Center" />
    <Rectangle Fill="{{DynamicResource GameBannerTintBrush}}" Opacity="{{DynamicResource GameBannerDarken}}" IsHitTestVisible="False" />
    <!-- banner darkening floor: any value above 0 starts at 50%, so the result is 50% + 50% x the slider -->
    <Rectangle Fill="{{DynamicResource GameBannerTintBrush}}" Opacity="0.5" Tag="{{DynamicResource GameBannerDarken}}" IsHitTestVisible="False">
        <Rectangle.Style>
            <Style TargetType="Rectangle">
                <Style.Triggers>
                    <DataTrigger Binding="{{Binding Tag, RelativeSource={{RelativeSource Self}}}}" Value="0">
                        <Setter Property="Visibility" Value="Collapsed" />
                    </DataTrigger>
                </Style.Triggers>
            </Style>
        </Rectangle.Style>
    </Rectangle>
    <!-- Scrim: the page's own brush, light at the top, closing in toward the title. -->
    <Rectangle Opacity="0.9">
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0.5,0" EndPoint="0.5,1">
                <GradientStop Color="#00000000" Offset="0" />
                <GradientStop Color="{{Binding Background.Color, ElementName=LayerSwatch}}" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
    <!-- Side vignette, like the dashboard's darkened scene edges. -->
    <Rectangle Opacity="0.6">
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0.5" EndPoint="1,0.5">
                <GradientStop Color="{{Binding Background.Color, ElementName=LayerSwatch}}" Offset="0" />
                <GradientStop Color="#00000000" Offset="0.35" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
    <Rectangle Opacity="0.4">
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0.5" EndPoint="1,0.5">
                <GradientStop Color="#00000000" Offset="0.8" />
                <GradientStop Color="{{Binding Background.Color, ElementName=LayerSwatch}}" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
    <!-- Fade into the page. -->
    <Rectangle Opacity="0.5">
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0.5,0" EndPoint="0.5,1">
                <GradientStop Color="#00000000" Offset="0.45" />
                <GradientStop Color="{{Binding Background.Color, ElementName=LayerSwatch}}" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
</Grid>'''


ATTR_DETAILS = ' HorizontalAlignment="Stretch" Margin="32,0,40,0"'
ATTR_GRID = ' Margin="24,0,24,0"'


def empty_state(viewport):
    height = 'VerticalAlignment="Top" Height="{Binding ViewportHeight, ElementName=PART_ScrollViewHost}"' if viewport else 'VerticalAlignment="Center"'
    return f'''<!-- Empty state (no game selected): the keystone mark, outline only, with the dashboard's SearchingAnimation on it ([CSS]
     play.css: wash-color white to #7aa8b7 and back, a 2s loop), and "No game selected" in the title face. The loop runs only
     while this shows (RemoveStoryboard on exit). Centered in the visible area. -->
<Grid {height}>
    <Grid.Style>
        <Style TargetType="Grid">
            <Setter Property="Visibility" Value="Collapsed" />
            <Style.Triggers>
                <DataTrigger Binding="{{Binding Game, FallbackValue={{x:Null}}}}" Value="{{x:Null}}">
                    <Setter Property="Visibility" Value="Visible" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Grid.Style>
    <StackPanel HorizontalAlignment="Center" VerticalAlignment="Center" Margin="0,0,0,40">
        <Grid Width="72" Height="72" HorizontalAlignment="Center">
            <Path Data="M12 2.5 L20.5 7.4 L18.4 18.6 L12 21.4 L5.6 18.6 L3.5 7.4 Z" Stretch="Uniform" StrokeThickness="1.5" StrokeLineJoin="Round"
                  Stroke="{{DynamicResource TextBrushDarker}}" Margin="2" />
            <Path Data="M12 7 L16.2 9.4 L15.1 15.6 L12 17 L8.9 15.6 L7.8 9.4 Z" Stretch="Uniform" StrokeThickness="1.5" StrokeLineJoin="Round"
                  Stroke="{{DynamicResource TextBrushDarker}}" Margin="20" />
            <Grid>
                <Grid.Style>
                    <Style TargetType="Grid">
                        <Setter Property="Opacity" Value="0" />
                        <Style.Triggers>
                            <DataTrigger Binding="{{Binding Game, FallbackValue={{x:Null}}}}" Value="{{x:Null}}">
                                <DataTrigger.EnterActions>
                                    <BeginStoryboard x:Name="KeystoneWash">
                                        <Storyboard RepeatBehavior="Forever">
                                            <DoubleAnimationUsingKeyFrames Storyboard.TargetProperty="Opacity">
                                                <EasingDoubleKeyFrame KeyTime="0:0:0" Value="0" />
                                                <EasingDoubleKeyFrame KeyTime="0:0:1" Value="1"><EasingDoubleKeyFrame.EasingFunction><SineEase EasingMode="EaseInOut" /></EasingDoubleKeyFrame.EasingFunction></EasingDoubleKeyFrame>
                                                <EasingDoubleKeyFrame KeyTime="0:0:2" Value="0"><EasingDoubleKeyFrame.EasingFunction><SineEase EasingMode="EaseInOut" /></EasingDoubleKeyFrame.EasingFunction></EasingDoubleKeyFrame>
                                            </DoubleAnimationUsingKeyFrames>
                                        </Storyboard>
                                    </BeginStoryboard>
                                </DataTrigger.EnterActions>
                                <DataTrigger.ExitActions>
                                    <RemoveStoryboard BeginStoryboardName="KeystoneWash" />
                                </DataTrigger.ExitActions>
                            </DataTrigger>
                        </Style.Triggers>
                    </Style>
                </Grid.Style>
                <Path Data="M12 2.5 L20.5 7.4 L18.4 18.6 L12 21.4 L5.6 18.6 L3.5 7.4 Z" Stretch="Uniform" StrokeThickness="1.5" StrokeLineJoin="Round"
                      Stroke="{{DynamicResource SelectedForegroundBrush}}" Margin="2" />
                <Path Data="M12 7 L16.2 9.4 L15.1 15.6 L12 17 L8.9 15.6 L7.8 9.4 Z" Stretch="Uniform" StrokeThickness="1.5" StrokeLineJoin="Round"
                      Stroke="{{DynamicResource SelectedForegroundBrush}}" Margin="20" />
            </Grid>
        </Grid>
        <TextBlock Text="{{DynamicResource LOCErrorNoGameSelected}}" HorizontalAlignment="Center" Margin="0,22,0,0"
                   FontFamily="{{DynamicResource HeadingFontFamily}}" FontSize="{{DynamicResource FontSizeLarge}}" FontWeight="SemiBold"
                   Typography.Capitals="AllSmallCaps" Foreground="{{DynamicResource TextBrushDarker}}" />
    </StackPanel>
</Grid>'''


def hide_when_empty(kind="Grid", attrs=""):
    return f'''<{kind}{attrs}>
    <{kind}.Style>
        <Style TargetType="{kind}">
            <Style.Triggers>
                <DataTrigger Binding="{{Binding Game, FallbackValue={{x:Null}}}}" Value="{{x:Null}}">
                    <Setter Property="Visibility" Value="Collapsed" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </{kind}.Style>'''



def spacer(height, banner=340):
    return f'''<Border IsHitTestVisible="False">
    <Border.Style>
        <Style TargetType="Border">
            <Setter Property="Height" Value="{{Binding ActualHeight, ElementName=HeroArt, Converter={{StaticResource MathConverter}}, ConverterParameter='x * {height} / {banner}'}}" />
            <Style.Triggers>
                <DataTrigger Binding="{{Binding ActualHeight, ElementName=HeroArt}}" Value="0">
                    <Setter Property="Height" Value="0" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Border.Style>
</Border>'''


def edit_button(margin, size, column=None):
    col = f' Grid.Column="{column}"' if column is not None else ""
    return f'''<Button x:Name="PART_ButtonEditGame"{col} Margin="{margin}" Height="{size}" Width="{size}" Padding="0" Focusable="False"
        ToolTip="{{DynamicResource LOCEditGame}}">
    <ContentControl Width="18" Height="18" Focusable="False" IsTabStop="False"
                    Content="{{DynamicResource IconEdit}}"
                    ContentTemplate="{{DynamicResource IconTemplate}}" />
</Button>'''


def title(size):
    return f'''<TextBlock Name="PART_TextDisplayName"
           FontFamily="{{DynamicResource HeadingFontFamily}}"
           FontSize="{size}" FontWeight="SemiBold"
           Typography.Capitals="AllSmallCaps"
           TextWrapping="Wrap" VerticalAlignment="Center"
           Foreground="{{DynamicResource SelectedForegroundBrush}}" />'''


HEADER_NOTE = """    HtmlForeground and LinkForeground are Color-typed properties of HtmlTextView, so they read Color keys (the build
    check allows exactly these two attributes). Generated by art/overview.py; edit the generator, not this file."""


def details():
    header = f'''<DockPanel Margin="0,24,0,28" MaxWidth="1100" Grid.Row="1" Background="Transparent">
    <!-- Cover: a black slot with a 1px edge, hidden while the game has no cover. -->
    <Border DockPanel.Dock="Right" VerticalAlignment="Bottom" Margin="28,0,0,0"
            BorderBrush="{{DynamicResource SlotBorderBrush}}" BorderThickness="1"
            Background="{{DynamicResource GridItemBackgroundBrush}}">
        <Border.Style>
            <Style TargetType="Border">
                <Style.Triggers>
                    <DataTrigger Binding="{{Binding Source, ElementName=PART_ImageCover}}" Value="{{x:Null}}">
                        <Setter Property="Visibility" Value="Collapsed" />
                    </DataTrigger>
                </Style.Triggers>
            </Style>
        </Border.Style>
        <Image Name="PART_ImageCover" Height="{{Settings GameDetailsCoverHeight}}"
               StretchDirection="Both" Stretch="Uniform" RenderOptions.BitmapScalingMode="Fant" />
    </Border>

    <StackPanel VerticalAlignment="Bottom" DockPanel.Dock="Left">
        <DockPanel>
            <Image Name="PART_ImageIcon" MaxHeight="40" MaxWidth="40" DockPanel.Dock="Left" Margin="0,0,14,0"
                   VerticalAlignment="Center" RenderOptions.BitmapScalingMode="Fant" />
{indent(title(38), 12)}
        </DockPanel>
        <StackPanel HorizontalAlignment="Left" Orientation="Horizontal" Margin="0,12,0,0">
            <Grid>
                <Button Name="PART_ButtonPlayAction" Width="220" Height="48" Style="{{DynamicResource PlayButton}}" />
                <Button Name="PART_ButtonContextAction" Tag="ContextAction" Style="{{DynamicResource PlayButton}}" Width="220" Height="48" />
                <Control Style="{{DynamicResource RunningActionIndicator}}" Height="48" />
            </Grid>
            <Button Name="PART_ButtonMoreActions" Width="48" Height="48" Padding="0" Margin="12,0,0,0"
                    ToolTip="{{DynamicResource LOCMoreAction}}" Focusable="False">
                <ContentControl Width="18" Height="18" Focusable="False" IsTabStop="False"
                                Content="{{DynamicResource IconOptions}}"
                                ContentTemplate="{{DynamicResource IconTemplate}}" />
            </Button>
{indent(edit_button("12,0,0,0", 48), 12)}
        </StackPanel>
    </StackPanel>
</DockPanel>'''

    columns = f'''<DockPanel MaxWidth="1100" Grid.Row="2">
    <StackPanel DockPanel.Dock="Right" Width="{{DynamicResource GameDetailsPaneWidth}}" Margin="32,0,0,24">
{indent(heading("LOCGameDetails"), 8)}
{indent(pane_xaml(True), 8)}
    </StackPanel>
    <StackPanel>
{indent(TEXT_COLUMN, 8)}
    </StackPanel>
</DockPanel>'''

    body = f'''<ScrollViewer HorizontalScrollBarVisibility="Disabled" VerticalScrollBarVisibility="Auto"
              Style="{{DynamicResource DetailsScrollViewer}}" Visibility="Visible" x:Name="PART_ScrollViewHost">
    <Grid>
{indent(hero("ContentBackgroundBrush"), 8)}
{indent(hide_when_empty("Grid", ATTR_DETAILS), 8)}
            <Grid.RowDefinitions>
                <RowDefinition Height="Auto" />
                <RowDefinition Height="Auto" />
                <RowDefinition Height="*" />
            </Grid.RowDefinitions>
{indent(grid_spacer(spacer(150), 8, 'DetailsBannerSpacer'), 12)}
{indent(header, 12)}
{indent(columns, 12)}
        </Grid>
{indent(empty_state(True), 8)}
    </Grid>
</ScrollViewer>'''
    return wrap("DetailsViewGameOverview", f'''    The game page of the Details view, read like a hero page of the Dota 2 dashboard: the game's art as a wide banner
    behind the header, darkened toward the title and at the sides; the title in the title font, large and white, with
    no rule under it; then the green PLAY button (DerivedStyles/PlayButton.xaml) with the grey bevel buttons
    beside it, and the cover in a black slot on the right. Below, two columns: Steam screenshots, description and
    notes on the left under section captions; on the right Game details, every metadata field with no card of its own
    (transparent, no edge, flush with the caption), six groups split by 1px dark lines, captions beside the values.
{HEADER_NOTE}''', body)


INLINE_CLOSE = '''<Button x:Name="InlineSidePanelCloseButton" DockPanel.Dock="Left" HorizontalAlignment="Left" VerticalAlignment="Center"
        Margin="0,0,10,0" Width="28" Height="28" Padding="0" Focusable="False" Cursor="Hand"
        ToolTip="{DynamicResource LOCCloseLabel}" Command="{MainViewModel CloseGameSideBarCommand}"
        Template="{Binding Template, ElementName=SidePanelCloseButton}">
    <Button.Style>
        <Style TargetType="Button" BasedOn="{StaticResource {x:Type Button}}">
            <Setter Property="Visibility" Value="{Binding Tag, ElementName=SidePanelCloseButton, Converter={StaticResource MathConverter}, ConverterParameter='x &lt; 120 ? `Visible` : `Collapsed`'}" />
            <Style.Triggers>
                <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                    <Setter Property="Visibility" Value="Visible" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Button.Style>
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


def grid_panel():
    columns = responsive_body(f'''<StackPanel Grid.Column="0">
{indent(TEXT_COLUMN, 8)}
    </StackPanel>''', f'''<StackPanel Grid.Column="2" Width="{{DynamicResource GridDetailsPaneWidth}}" Margin="0,0,0,24" VerticalAlignment="Top">
{indent(heading("LOCGameDetails"), 8)}
{indent(pane_xaml(False), 8)}
    </StackPanel>''', attrs='VerticalAlignment="Top"')

    header = f'''<DockPanel Panel.ZIndex="2">
{indent(INLINE_CLOSE, 4)}
    <Image Name="PART_ImageIcon" DockPanel.Dock="Left" MaxHeight="32" MaxWidth="32"
           RenderOptions.BitmapScalingMode="Fant" Margin="0,0,12,0" />
{indent(title("{DynamicResource FontSizeLargest}"), 4)}
</DockPanel>
<Grid Margin="0,12,0,24" Background="Transparent">
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="*" MaxWidth="200" />
        <ColumnDefinition Width="Auto" />
        <ColumnDefinition Width="Auto" />
    </Grid.ColumnDefinitions>
    <Button Name="PART_ButtonPlayAction" Grid.Column="0" Height="44" Style="{{DynamicResource PlayButton}}" />
    <Button Name="PART_ButtonContextAction" Tag="ContextAction" Style="{{DynamicResource PlayButton}}" Grid.Column="0" Height="44" />
    <Button Name="PART_ButtonMoreActions" Grid.Column="1" Width="44" Height="44" Padding="0" Margin="10,0,0,0"
            ToolTip="{{DynamicResource LOCMoreAction}}" Focusable="False">
        <ContentControl Width="18" Height="18" Focusable="False" IsTabStop="False"
                        Content="{{DynamicResource IconOptions}}"
                        ContentTemplate="{{DynamicResource IconTemplate}}" />
    </Button>
{indent(edit_button("10,0,0,0", 44, column=2), 4)}
    <Control Style="{{DynamicResource RunningActionIndicator}}" Grid.Column="0" Height="44" />
</Grid>
{columns}'''

    close = '''<Button x:Name="SidePanelCloseButton" Tag="{DynamicResource GameBannerHeight}"

        HorizontalAlignment="Left" VerticalAlignment="Top" Margin="12,12,0,0" Width="28" Height="28" Padding="0"
        Focusable="False" Cursor="Hand" ToolTip="{DynamicResource LOCCloseLabel}"
        Command="{MainViewModel CloseGameSideBarCommand}">
<Button.Style><Style TargetType="Button" BasedOn="{StaticResource {x:Type Button}}">
    <Setter Property="Visibility" Value="{Binding Tag, RelativeSource={RelativeSource Self}, Converter={StaticResource MathConverter}, ConverterParameter='x &lt; 120 ? `Collapsed` : `Visible`'}" />
    <Style.Triggers>
            <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                <Setter Property="Visibility" Value="Collapsed" />
            </DataTrigger>
            <DataTrigger Binding="{Binding Game, FallbackValue={x:Null}}" Value="{x:Null}"><Setter Property="Visibility" Value="Visible" /></DataTrigger></Style.Triggers>
</Style></Button.Style>
    <!-- Close: a 28x28 plate that reads at rest (the theme's button plate, a rim and a bright glyph) and turns the danger color on hover. -->
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

    body = f'''<Border BorderBrush="{{DynamicResource BevelShadowBrush}}" Background="Transparent">
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
{indent(empty_state(False), 8)}
        <DockPanel>
            <ScrollViewer CanContentScroll="False" DockPanel.Dock="Top" HorizontalScrollBarVisibility="Disabled" VerticalScrollBarVisibility="Auto"
                          x:Name="PART_ScrollViewHost">
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
{indent(hero("ContentBackgroundBrush"), 20)}
{indent(hide_when_empty("StackPanel", ATTR_GRID), 20)}
{indent(grid_spacer(spacer(110), 4), 24)}
                        <StackPanel Margin="0,20,0,0">
{indent(header, 28)}
                        </StackPanel>
                    </StackPanel>
                </Grid>
            </ScrollViewer>
        </DockPanel>
{indent(close, 8)}
    </Grid>
</Border>'''
    return wrap("GridViewGameOverview", f'''    The game panel beside the cover grid, transparent like the Details view so the library art shows through: the
    game's art as a banner at the top with the same scrim and gradient transition toward the title; the title in
    the title font with no rule under it; the green PLAY button and a grey bevel button under it; then two
    columns: Steam screenshots, description and notes on the left, Game details on the right (the six metadata
    groups with no card, captions beside values). A 1px edge on the grid side and a close button before the icon below 120px banner height, otherwise over the top-left corner.
{HEADER_NOTE}''', body)


def wrap(name, desc, body):
    return f'''<!--
    Overlay on Playnite Default/Views/{name}.xaml.
{desc}
-->
<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
                    xmlns:pbeh="clr-namespace:Playnite.Behaviors;assembly=Playnite">

    <Style TargetType="{{x:Type {name}}}">
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="{{x:Type {name}}}">
{indent(body, 20)}
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
'''


def main():
    converter = Path(__file__).resolve().parents[4] / "scripts" / "game-page-breakpoints.mjs"
    pages = {"Details": details(), "Grid": grid_panel()}
    responsive = {
        view: run(["node", str(converter), "--stdin", view], input=source,
                  stdout=PIPE, check=True, encoding="utf-8").stdout
        for view, source in pages.items()
    }
    ROOT.mkdir(parents=True, exist_ok=True)
    for view, source in responsive.items():
        path = ROOT / f"{view}ViewGameOverview.xaml"
        path.write_text(source, encoding="utf-8", newline="\n")
        print("wrote", path)


if __name__ == "__main__":
    main()
