"""Writes src/Views/DetailsViewGameOverview.xaml and src/Views/GridViewGameOverview.xaml.

Both views share the skeleton in src/themes/AGENTS.md (banner, header, Steam screenshots, two columns) and one
metadata pane of six groups. Generating them keeps the groups, part names and spacing identical in the two files.
Run from anywhere: python3 art/overview.py
"""
from pathlib import Path

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
    """beside=True: caption column beside the value (details view); False: caption above (grid panel)."""
    if beside:
        return (f'<Grid x:Name="PART_Elem{field}" Margin="0,{FIELD_GAP},0,{FIELD_GAP}">\n'
                '    <Grid.ColumnDefinitions>\n'
                '        <ColumnDefinition Width="112" />\n'
                '        <ColumnDefinition Width="*" />\n'
                '    </Grid.ColumnDefinitions>\n'
                f'    <TextBlock Text="{{DynamicResource {label}}}" Style="{{DynamicResource HeadingTextBlock}}" FontSize="{{DynamicResource FontSize}}" TextWrapping="Wrap" Margin="0,0,12,0" />\n'
                + indent(value_xaml(kind, part, True), 4) + "\n"
                '</Grid>')
    return (f'<StackPanel x:Name="PART_Elem{field}" Margin="0,{FIELD_GAP},0,{FIELD_GAP}">\n'
            f'    <TextBlock Text="{{DynamicResource {label}}}" Style="{{DynamicResource HeadingTextBlock}}" FontSize="{{DynamicResource FontSizeSmall}}" Margin="0,0,0,4" />\n'
            + indent(value_xaml(kind, part, False), 4) + "\n"
            '</StackPanel>')


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
    # The pane is a dashboard side panel: slate (ExpanderBackgroundBrush), 1px black edge.
    return ('<Border Background="{DynamicResource ExpanderBackgroundBrush}" BorderBrush="{DynamicResource BevelShadowBrush}"\n'
            '        BorderThickness="1" Padding="16,4,16,4">\n'
            '    <Border ClipToBounds="True">\n'
            f'        <StackPanel Margin="0,{top},0,-{FIELD_GAP}">\n'
            + indent(groups, 12) + "\n"
            '        </StackPanel>\n'
            '    </Border>\n'
            '</Border>')


def heading(text_key, top="0,0,0,0"):
    return (f'<TextBlock Text="{{DynamicResource {text_key}}}" Margin="{top}" Style="{{DynamicResource HeadingTextBlock}}" />\n'
            '<Control Template="{DynamicResource DividerTemplate}" Focusable="False" IsTabStop="False" IsHitTestVisible="False" Margin="0,8,0,12" />')


STEAM = '''<Grid>
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
            </Style.Triggers>
        </Style>
    </Grid.Style>
    <Grid.CacheMode>
        <BitmapCache EnableClearType="False" RenderAtScale="1" SnapsToDevicePixels="False" />
    </Grid.CacheMode>
    <Grid.OpacityMask>
        <LinearGradientBrush StartPoint="0.5,0" EndPoint="0.5,1">
            <GradientStop Color="Black" Offset="0" />
            <GradientStop Color="Black" Offset="0.45" />
            <GradientStop Color="Transparent" Offset="1" />
        </LinearGradientBrush>
    </Grid.OpacityMask>
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill"
               HorizontalAlignment="Center" VerticalAlignment="Center" />
    <!-- Scrim: the page's own brush, light at the top, closing in toward the title. -->
    <Border Background="{{DynamicResource {brush}}}">
        <Border.OpacityMask>
            <LinearGradientBrush StartPoint="0.5,0" EndPoint="0.5,1">
                <GradientStop Color="#33000000" Offset="0" />
                <GradientStop Color="#80000000" Offset="0.5" />
                <GradientStop Color="#E6000000" Offset="1" />
            </LinearGradientBrush>
        </Border.OpacityMask>
    </Border>
    <!-- Side vignette, like the dashboard's darkened scene edges. -->
    <Border Background="{{DynamicResource {brush}}}">
        <Border.OpacityMask>
            <LinearGradientBrush StartPoint="0,0.5" EndPoint="1,0.5">
                <GradientStop Color="#99000000" Offset="0" />
                <GradientStop Color="Transparent" Offset="0.35" />
                <GradientStop Color="Transparent" Offset="0.8" />
                <GradientStop Color="#66000000" Offset="1" />
            </LinearGradientBrush>
        </Border.OpacityMask>
    </Border>
</Grid>'''


def spacer(height):
    return f'''<Border IsHitTestVisible="False">
    <Border.Style>
        <Style TargetType="Border">
            <Setter Property="Height" Value="{height}" />
            <Style.Triggers>
                <DataTrigger Binding="{{Binding ActualHeight, ElementName=HeroArt}}" Value="0">
                    <Setter Property="Height" Value="0" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Border.Style>
</Border>'''


def edit_button(ancestor, margin, size):
    return f'''<Button x:Name="PART_ButtonEditGame" Margin="{margin}" Height="{size}" Width="{size}" Padding="0" Focusable="False">
    <Button.Style>
        <Style TargetType="Button" BasedOn="{{StaticResource {{x:Type Button}}}}">
            <Setter Property="Visibility" Value="Hidden" />
            <Style.Triggers>
                <DataTrigger Binding="{{Binding IsMouseOver, RelativeSource={{RelativeSource AncestorType={ancestor}}}}}" Value="True">
                    <Setter Property="Visibility" Value="Visible" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Button.Style>
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
        <Control Template="{{DynamicResource DividerTemplate}}" Focusable="False" IsTabStop="False" IsHitTestVisible="False"
                 Width="420" HorizontalAlignment="Left" Margin="0,12,0,0" />
        <StackPanel HorizontalAlignment="Left" Orientation="Horizontal" Margin="0,18,0,0">
            <Grid>
                <Button Name="PART_ButtonPlayAction" Width="220" Height="48" Style="{{DynamicResource PlayButton}}" />
                <Button Name="PART_ButtonContextAction" Width="220" Height="48" />
            </Grid>
            <Button Name="PART_ButtonMoreActions" Content="{{DynamicResource LOCMoreAction}}"
                    MinWidth="150" Height="48" Margin="12,0,0,0" />
{indent(edit_button("DockPanel", "12,0,0,0", 48), 12)}
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
              Style="{{DynamicResource DetailsScrollViewer}}" x:Name="PART_ScrollViewHost">
    <Grid>
{indent(hero("ContentBackgroundBrush"), 8)}
        <Grid HorizontalAlignment="Stretch" Margin="32,0,40,0">
            <Grid.RowDefinitions>
                <RowDefinition Height="Auto" />
                <RowDefinition Height="Auto" />
                <RowDefinition Height="*" />
            </Grid.RowDefinitions>
{indent(spacer(150), 12)}
{indent(header, 12)}
{indent(columns, 12)}
        </Grid>
    </Grid>
</ScrollViewer>'''
    return wrap("DetailsViewGameOverview", f'''    The game page of the Details view, read like a hero page of the Dota 2 dashboard: the game's art as a wide banner
    behind the header, darkened toward the title and at the sides; the title in the title font, large and white, over
    the paired separator; then the green PLAY button (DerivedStyles/PlayButton.xaml) with the grey bevel buttons
    beside it, and the cover in a black slot on the right. Below, two columns: Steam screenshots, description and
    notes on the left under section captions; on the right Game details, every metadata field in one dashboard side
    panel (slate, 1px black edge) of six groups split by 1px dark lines, captions beside the values.
{HEADER_NOTE}''', body)


def grid_panel():
    header = f'''<DockPanel>
    <Image Name="PART_ImageIcon" DockPanel.Dock="Left" MaxHeight="32" MaxWidth="32"
           RenderOptions.BitmapScalingMode="Fant" Margin="0,0,12,0" />
{indent(title("{DynamicResource FontSizeLargest}"), 4)}
</DockPanel>
<Control Template="{{DynamicResource DividerTemplate}}" Focusable="False" IsTabStop="False" IsHitTestVisible="False" Margin="0,10,0,0" />
<Grid Margin="0,16,0,24" Background="Transparent">
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="*" MaxWidth="200" />
        <ColumnDefinition Width="*" MaxWidth="150" />
        <ColumnDefinition Width="Auto" />
    </Grid.ColumnDefinitions>
    <Button Name="PART_ButtonPlayAction" Grid.Column="0" Height="44" Style="{{DynamicResource PlayButton}}" />
    <Button Name="PART_ButtonContextAction" Grid.Column="0" Height="44" />
    <Button Name="PART_ButtonMoreActions" Content="{{DynamicResource LOCMoreAction}}" Grid.Column="1" Height="44" Margin="10,0,0,0" />
{indent(edit_button("Grid", "10,0,8,0", 44), 4)}
</Grid>
<Grid VerticalAlignment="Top">
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="*" />
        <ColumnDefinition Width="24" />
        <ColumnDefinition Width="Auto" />
    </Grid.ColumnDefinitions>
    <StackPanel Grid.Column="2" Width="{{DynamicResource GridDetailsPaneWidth}}" Margin="0,0,0,24" VerticalAlignment="Top">
{indent(heading("LOCGameDetails"), 8)}
{indent(pane_xaml(False), 8)}
    </StackPanel>
    <StackPanel Grid.Column="0">
{indent(TEXT_COLUMN, 8)}
    </StackPanel>
</Grid>'''

    close = '''<Button HorizontalAlignment="Right" VerticalAlignment="Top" Margin="0,14,26,0" Width="36" Height="36"
        Focusable="False" Cursor="Hand" Foreground="{DynamicResource MainMenuButtonForegroundBrush}"
        Command="{MainViewModel CloseGameSideBarCommand}">
    <Button.Template>
        <ControlTemplate TargetType="{x:Type Button}">
            <Border x:Name="Chrome" Background="Transparent">
                <ContentPresenter Width="18" Height="18" HorizontalAlignment="Center" VerticalAlignment="Center"
                                  Content="{DynamicResource IconWindowClose}"
                                  ContentTemplate="{DynamicResource IconTemplate}" />
            </Border>
            <ControlTemplate.Triggers>
                <Trigger Property="IsMouseOver" Value="True">
                    <Setter TargetName="Chrome" Property="Background" Value="{DynamicResource DangerBrush}" />
                    <Setter Property="Foreground" Value="{DynamicResource DangerForegroundBrush}" />
                </Trigger>
            </ControlTemplate.Triggers>
        </ControlTemplate>
    </Button.Template>
</Button>'''

    body = f'''<Border BorderBrush="{{DynamicResource BevelShadowBrush}}" Background="{{DynamicResource NormalBrush}}">
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
        <DockPanel>
            <TextBlock Text="{{DynamicResource LOCErrorNoGameSelected}}" Margin="0,20,0,0" DockPanel.Dock="Top"
                       HorizontalAlignment="Center" VerticalAlignment="Center">
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
            <ScrollViewer DockPanel.Dock="Top" HorizontalScrollBarVisibility="Disabled" VerticalScrollBarVisibility="Auto"
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
{indent(hero("NormalBrush"), 20)}
                    <StackPanel Margin="24,0,24,0">
{indent(spacer(110), 24)}
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
    return wrap("GridViewGameOverview", f'''    The game panel beside the cover grid, a dashboard side panel (NormalBrush, the chat panel slate #161E24) with a
    1px black edge on the grid side: the game's art as a banner at the top, darkened toward the title; the title in
    the title font over the paired separator; the green PLAY button and a grey bevel button under it; then two
    columns: Steam screenshots, description and notes on the left, Game details on the right (the six metadata
    groups in a slate card, captions above values). A close button sits over the top-right corner.
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


if __name__ == "__main__":
    ROOT.mkdir(parents=True, exist_ok=True)
    (ROOT / "DetailsViewGameOverview.xaml").write_text(details(), encoding="utf-8")
    (ROOT / "GridViewGameOverview.xaml").write_text(grid_panel(), encoding="utf-8")
    print("wrote", ROOT / "DetailsViewGameOverview.xaml", ROOT / "GridViewGameOverview.xaml")
