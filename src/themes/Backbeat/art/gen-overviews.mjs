// Generates Backbeat's DetailsViewGameOverview.xaml and GridViewGameOverview.xaml from one field table.
// Usage: node src/themes/Backbeat/art/gen-overviews.mjs src/themes/Backbeat/src
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const out = process.argv[2];
if (!out) throw new Error('pass the theme src dir');

const groups = [
  ['MetaProgress', [
    ['CompletionStatus', 'LOCCompletionStatus', 'button', 'PART_ButtonCompletionStatus'],
    ['PlayTime', 'LOCTimePlayed', 'text', 'PART_TextPlayTime'],
    ['LastPlayed', 'LOCLastPlayed', 'text', 'PART_TextLastActivity'],
    ['RecentActivity', 'LOCRecentActivityLabel', 'text', 'PART_TextRecentActivity'],
    ['Added', 'LOCDateAddedLabel', 'text', 'PART_TextAdded'],
  ]],
  ['MetaScores', [
    ['CommunityScore', 'LOCCommunityScore', 'score', 'PART_TextCommunityScore'],
    ['CriticScore', 'LOCCriticScore', 'score', 'PART_TextCriticScore'],
    ['UserScore', 'LOCUserScore', 'score', 'PART_TextUserScore'],
  ]],
  ['MetaAbout', [
    ['Developers', 'LOCDeveloperLabel', 'items', 'PART_ItemsDevelopers'],
    ['Publishers', 'LOCPublisherLabel', 'items', 'PART_ItemsPublishers'],
    ['ReleaseDate', 'LOCGameReleaseDateTitle', 'button', 'PART_ButtonReleaseDate'],
    ['Series', 'LOCSeriesLabel', 'items', 'PART_ItemsSeries'],
    ['AgeRating', 'LOCAgeRatingLabel', 'items', 'PART_ItemsAgeRatings'],
    ['Region', 'LOCRegionLabel', 'items', 'PART_ItemsRegions'],
  ]],
  ['MetaTags', [
    ['Platform', 'LOCPlatformTitle', 'chips', 'PART_ItemsPlatforms'],
    ['Genres', 'LOCGenreLabel', 'chips', 'PART_ItemsGenres'],
    ['Categories', 'LOCGameCategoriesTitle', 'chips', 'PART_ItemsCategories'],
    ['Features', 'LOCFeaturesLabel', 'chips', 'PART_ItemsFeatures'],
    ['Tags', 'LOCTagsLabel', 'chips', 'PART_ItemsTags'],
  ]],
  ['MetaLibrary', [
    ['Library', 'LOCGameProviderTitle', 'button', 'PART_ButtonLibrary'],
    ['Source', 'LOCSourceLabel', 'button', 'PART_ButtonSource'],
    ['Version', 'LOCVersionLabel', 'button', 'PART_ButtonVersion'],
    ['InstallSize', 'LOCInstallSizeLabel', 'text', 'PART_TextInstallSize'],
    ['InstallDirectory', 'LOCGameInstallDirTitle', 'button', 'PART_ButtonInstallDirectory'],
  ]],
  ['MetaLinks', [
    ['Links', 'LOCLinksLabel', 'items', 'PART_ItemsLinks'],
  ]],
];

const ind = (s, n) => s.split('\n').map(l => (l ? ' '.repeat(n) + l : l)).join('\n');

function value(kind, part) {
  switch (kind) {
    case 'button': return `<Button x:Name="${part}" HorizontalAlignment="Left" VerticalAlignment="Center" Style="{DynamicResource PropertyItemButton}" />`;
    case 'text': return `<TextBlock x:Name="${part}" VerticalAlignment="Center" TextWrapping="Wrap" Foreground="{DynamicResource TextBrush}" />`;
    case 'score': return `<TextBlock x:Name="${part}" HorizontalAlignment="Left" VerticalAlignment="Center" Style="{DynamicResource TextBlockGameScore}" />`;
    case 'items':
    case 'chips': return `<ItemsControl x:Name="${part}" Tag="${kind === 'chips' ? 'Chip' : ''}">
    <ItemsControl.ItemsPanel>
        <ItemsPanelTemplate>
            <WrapPanel />
        </ItemsPanelTemplate>
    </ItemsControl.ItemsPanel>
</ItemsControl>`;
  }
}

const caption = (loc, extra = '') =>
  `<TextBlock Text="{DynamicResource ${loc}}" FontSize="{DynamicResource FontSizeSmall}" FontWeight="SemiBold" Foreground="{DynamicResource TextBrushDarker}" TextWrapping="Wrap"${extra || ' Margin="0,2,0,0"'} />`;

function field([name, loc, kind, part], layout) {
  if (layout === 'side') {
    return `<Border x:Name="PART_Elem${name}" Margin="0,7">
    <Grid>
        <Grid.ColumnDefinitions>
            <ColumnDefinition Width="104" />
            <ColumnDefinition Width="*" />
        </Grid.ColumnDefinitions>
        ${caption(loc)}
        <Border Grid.Column="1" Margin="8,0,0,0">
${ind(value(kind, part), 12)}
        </Border>
    </Grid>
</Border>`;
  }
  let gridValue = value(kind, part).replace(' x:Name=', ' Grid.Column="2" x:Name=');
  if (kind === 'score') gridValue = gridValue.replace(' />', ' TextWrapping="Wrap" />');
  return `<Border x:Name="PART_Elem${name}" Margin="0,7">
    <Grid>
        <Grid.ColumnDefinitions>
            <ColumnDefinition Width="2*" />
            <ColumnDefinition Width="12" />
            <ColumnDefinition Width="3*" />
        </Grid.ColumnDefinitions>
        ${caption(loc, ' VerticalAlignment="Top"')}
${ind(gridValue, 8)}
    </Grid>
</Border>`;
}

function group([gname, fields], layout) {
  const conds = fields.map(f => `<Condition Binding="{Binding Visibility, ElementName=PART_Elem${f[0]}}" Value="Collapsed" />`);
  const trig = fields.length === 1
    ? `<DataTrigger Binding="{Binding Visibility, ElementName=PART_Elem${fields[0][0]}}" Value="Collapsed">
    <Setter Property="Visibility" Value="Collapsed" />
</DataTrigger>`
    : `<MultiDataTrigger>
    <MultiDataTrigger.Conditions>
${ind(conds.join('\n'), 8)}
    </MultiDataTrigger.Conditions>
    <Setter Property="Visibility" Value="Collapsed" />
</MultiDataTrigger>`;
  return `<Border x:Name="${gname}" Margin="0,12,0,0" Padding="0,12,0,0" BorderThickness="0,2,0,0" BorderBrush="{DynamicResource WindowPanelSeparatorBrush}">
    <Border.Style>
        <Style TargetType="Border">
            <Style.Triggers>
${ind(trig, 16)}
            </Style.Triggers>
        </Style>
    </Border.Style>
    <StackPanel>
${ind(fields.map(f => field(f, layout)).join('\n'), 8)}
    </StackPanel>
</Border>`;
}

// Section header: the word on a slanted sticker, then a hard rule ending in four beat ticks.
const header = (loc, marker, margin = '0,0,0,12') => `<DockPanel Margin="${margin}">
    <Grid DockPanel.Dock="Left">
        <Control Template="{DynamicResource SlantPlateTemplate}" Background="{DynamicResource ${marker}}"
                 BorderBrush="{DynamicResource PanelShadowBrush}" BorderThickness="2" Foreground="{DynamicResource PanelShadowBrush}" />
        <TextBlock Text="{DynamicResource ${loc}}" Style="{DynamicResource HeadingTextBlock}" Margin="12,3,12,3" />
    </Grid>
    <Control Template="{DynamicResource DividerTemplate}" Foreground="{DynamicResource HeadingRuleBrush}" Margin="12,0,0,0" VerticalAlignment="Center" />
</DockPanel>`;

// The metadata pane is a comic panel: tilted card, 3px white line, hard orange shadow, halftone in its corner.
// Groups sit in a clipping wrapper pulled up by 2 x 12 + 2 + 7 = 33 (first rule hidden) and down by 7.
function pane(layout, widthKey, padding) {
  return `<Grid VerticalAlignment="Top">
    <Control Template="{DynamicResource AngledCardTemplate}" Background="{DynamicResource ExpanderBackgroundBrush}"
             BorderBrush="{DynamicResource FrameBrush}" BorderThickness="3" Foreground="{DynamicResource TitleSuffixBrush}" />
    <Control Template="{DynamicResource HalftoneTemplate}" Foreground="{DynamicResource HeadingMarkerBrush}"
             Width="180" Height="100" Margin="0,5,5,0" HorizontalAlignment="Right" VerticalAlignment="Top" Opacity="0.6" />
    <Border Padding="${padding}">
        <StackPanel Width="{DynamicResource ${widthKey}}">
${ind(header('LOCGameDetails', 'TitleSuffixBrush', '0,0,0,4'), 12)}
            <Grid ClipToBounds="True">
                <StackPanel Margin="0,-33,0,-7">
${ind(groups.map(g => group(g, layout)).join('\n'), 20)}
                </StackPanel>
            </Grid>
        </StackPanel>
    </Border>
</Grid>`;
}

// No OpacityMask on the art: the Play star animates over this area. The fade is a plain gradient to the page color.
// The halftone patch stays in the top 30% of the banner, clear of the Play star at any banner height.
const heroArt = `<Grid x:Name="HeroArt" VerticalAlignment="Top" IsHitTestVisible="False" ClipToBounds="True">
    <Grid.Style>
        <Style TargetType="Grid">
            <Setter Property="Height" Value="{DynamicResource GameBannerHeight}" />
            <Style.Triggers>
                <DataTrigger Binding="{Binding Visibility, ElementName=PART_ImageBackground}" Value="Collapsed">
                    <Setter Property="Height" Value="0" />
                </DataTrigger>
                <DataTrigger Binding="{Binding Source, ElementName=PART_ImageBackground}" Value="{x:Null}">
                    <Setter Property="Height" Value="0" />
                </DataTrigger>
                <DataTrigger Binding="{Binding Game.BackgroundImage}" Value="{x:Null}">
                    <Setter Property="Height" Value="0" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Grid.Style>
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill" />
    <Rectangle>
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                <GradientStop Color="#00000000" Offset="0.12" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
    <Rectangle Width="420" HorizontalAlignment="Right" VerticalAlignment="Top" Opacity="0.85" Fill="{DynamicResource HeadingMarkerAltBrush}"
               Height="{Binding ActualHeight, ElementName=HeroArt, Converter={StaticResource MathConverter}, ConverterParameter='x * 0.3'}">
        <Rectangle.OpacityMask>
            <ImageBrush ImageSource="{ThemeFile 'Images/fx/halftone-wide.png'}" Stretch="Fill" />
        </Rectangle.OpacityMask>
    </Rectangle>
</Grid>`;

// The slanted panel cut under the header. It sits in the content flow so it can never run behind the text columns.
const panelCut = `<Path Data="M0,100 L100,0" Stretch="Fill" Height="14" Stroke="{DynamicResource FrameBrush}" StrokeThickness="3" IsHitTestVisible="False" />`;

const spacer = (ratio, fallback) => `<Border>
    <Border.Style>
        <Style TargetType="Border">
            <Setter Property="Height" Value="{Binding ActualHeight, ElementName=HeroArt, Converter={StaticResource MathConverter}, ConverterParameter='${ratio}'}" />
            <Style.Triggers>
                <DataTrigger Binding="{Binding ActualHeight, ElementName=HeroArt}" Value="0">
                    <Setter Property="Height" Value="${fallback}" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Border.Style>
</Border>`;

// The title is headline italics over a hard ink copy offset 3px. The copy is bound to the real title, so it empties with it.
const titleStyle = `FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLargest}" FontStyle="Italic" TextWrapping="Wrap"`;
const title = `<DockPanel>
    <Image x:Name="PART_ImageIcon" MaxWidth="40" MaxHeight="40" Margin="0,0,12,0" DockPanel.Dock="Left" VerticalAlignment="Center" />
    <Grid VerticalAlignment="Center">
        <TextBlock Text="{Binding Text, ElementName=PART_TextDisplayName}" ${titleStyle} Foreground="{DynamicResource TextOutlineBrush}" Margin="3,3,0,0" IsHitTestVisible="False" />
        <TextBlock x:Name="PART_TextDisplayName" ${titleStyle} Foreground="{DynamicResource TextBrush}" Margin="0,0,3,3" />
    </Grid>
</DockPanel>`;

const actions = (margin) => `<StackPanel Orientation="Horizontal" Margin="${margin}">
    <Grid Width="150" Height="40">
        <Button x:Name="PART_ButtonPlayAction" Style="{DynamicResource PlayButton}" />
        <Button x:Name="PART_ButtonContextAction" />
    </Grid>
    <Button x:Name="PART_ButtonMoreActions" Width="40" Height="40" Padding="0" Margin="10,0,0,0" ToolTip="{DynamicResource LOCMoreAction}">
        <ContentControl Content="{DynamicResource IconOptions}" ContentTemplate="{DynamicResource IconTemplate}"
                        Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
    </Button>
    <Button x:Name="PART_ButtonEditGame" Width="40" Height="40" Padding="0" Margin="10,0,0,0" ToolTip="{DynamicResource LOCEditGame}">
        <ContentControl Content="{DynamicResource IconEdit}" ContentTemplate="{DynamicResource IconTemplate}"
                        Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
    </Button>
</StackPanel>`;

const steam = `<ContentControl x:Name="SteamScreenshots_SteamScreenshotsViewControl" Margin="0,0,0,18">
    <ContentControl.Style>
        <Style TargetType="ContentControl">
            <Setter Property="Visibility" Value="Collapsed" />
            <Style.Triggers>
                <DataTrigger Binding="{PluginSettings Plugin=SteamScreenshots, Path=IsControlVisible, FallbackValue=PluginUnavailable}" Value="True">
                    <Setter Property="Visibility" Value="Visible" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </ContentControl.Style>
</ContentControl>
<Grid>
    <Grid.Style>
        <Style TargetType="Grid">
            <Setter Property="Visibility" Value="Collapsed" />
            <Style.Triggers>
                <MultiDataTrigger>
                    <MultiDataTrigger.Conditions>
                        <Condition Binding="{Binding Game.PluginId}" Value="CB91DFC9-B977-43BF-8E70-55F46E410FAB" />
                        <Condition Binding="{PluginSettings Plugin=SteamScreenshots, Path=IsControlVisible, FallbackValue=PluginUnavailable}" Value="False" />
                    </MultiDataTrigger.Conditions>
                    <Setter Property="Visibility" Value="Visible" />
                </MultiDataTrigger>
            </Style.Triggers>
        </Style>
    </Grid.Style>
    <Border Tag="{Binding Game.Id, NotifyOnTargetUpdated=True}" Visibility="Collapsed" Height="150" Margin="0,0,0,18"
            Background="{DynamicResource ExpanderBackgroundBrush}" BorderBrush="{DynamicResource WindowPanelSeparatorBrush}" BorderThickness="2">
        <Border.Triggers>
            <EventTrigger RoutedEvent="Binding.TargetUpdated">
                <BeginStoryboard>
                    <Storyboard>
                        <ObjectAnimationUsingKeyFrames Storyboard.TargetProperty="Visibility">
                            <DiscreteObjectKeyFrame KeyTime="0:0:0" Value="{x:Static Visibility.Visible}" />
                            <DiscreteObjectKeyFrame KeyTime="0:0:12" Value="{x:Static Visibility.Collapsed}" />
                        </ObjectAnimationUsingKeyFrames>
                    </Storyboard>
                </BeginStoryboard>
            </EventTrigger>
        </Border.Triggers>
        <Grid x:Name="SkeletonCells" Margin="8">
            <Grid.ColumnDefinitions>
                <ColumnDefinition />
                <ColumnDefinition Width="8" />
                <ColumnDefinition />
            </Grid.ColumnDefinitions>
            <Border Background="{DynamicResource NormalBrush}" BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="2" />
            <Border Grid.Column="2" Background="{DynamicResource NormalBrush}" BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="2" />
        </Grid>
    </Border>
</Grid>`;

const textColumn = `<StackPanel>
${ind(steam, 4)}
    <StackPanel x:Name="PART_ElemDescription">
${ind(header('LOCGameDescriptionTitle', 'HeadingMarkerAltBrush'), 8)}
        <HtmlTextView x:Name="PART_HtmlDescription" HtmlFontFamily="{DynamicResource FontFamily}" HtmlFontSize="{DynamicResource FontSize}"
                      TextElement.Foreground="{DynamicResource TextBrush}" Tag="{DynamicResource PropertyItemForegroundBrush}"
                      HtmlForeground="{Binding Path=(TextElement.Foreground).Color, RelativeSource={RelativeSource Self}}"
                      LinkForeground="{Binding Tag.Color, RelativeSource={RelativeSource Self}}" />
    </StackPanel>
    <StackPanel x:Name="PART_ElemNotes" Margin="0,24,0,0">
${ind(header('LOCNotesLabel', 'HeadingMarkerBrush'), 8)}
        <TextBox x:Name="PART_TextNotes" IsReadOnly="True" TextWrapping="Wrap" Style="{DynamicResource BareTextBox}" Foreground="{DynamicResource TextBrush}" />
    </StackPanel>
</StackPanel>`;

// A loop that runs only while no game is selected. Opacity only: Playnite builds this page with no game bound,
// so a transform animated from a Style trigger would crash it.
const beatDot = (name, begin) => `<Ellipse Width="16" Height="16" Margin="5,0" Fill="{DynamicResource TextBrushDark}">
    <Ellipse.Style>
        <Style TargetType="Ellipse">
            <Setter Property="Opacity" Value="0.25" />
            <Style.Triggers>
                <DataTrigger Binding="{Binding Game, FallbackValue={x:Null}}" Value="{x:Null}">
                    <DataTrigger.EnterActions>
                        <BeginStoryboard x:Name="${name}">
                            <Storyboard RepeatBehavior="Forever">
                                <DoubleAnimationUsingKeyFrames Storyboard.TargetProperty="Opacity" BeginTime="${begin}" Duration="0:0:1.38" RepeatBehavior="Forever">
                                    <LinearDoubleKeyFrame KeyTime="0:0:0" Value="1" />
                                    <LinearDoubleKeyFrame KeyTime="0:0:0.34" Value="0.25" />
                                    <LinearDoubleKeyFrame KeyTime="0:0:1.38" Value="0.25" />
                                </DoubleAnimationUsingKeyFrames>
                            </Storyboard>
                        </BeginStoryboard>
                    </DataTrigger.EnterActions>
                    <DataTrigger.ExitActions>
                        <RemoveStoryboard BeginStoryboardName="${name}" />
                    </DataTrigger.ExitActions>
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Ellipse.Style>
</Ellipse>`;

// Empty state: a blank speech balloon on a jagged star, three dots pulsing on the beat (0.46s apart).
const emptyState = `<Grid VerticalAlignment="Top" Height="{Binding ViewportHeight, ElementName=PART_ScrollViewHost}">
    <Grid.Style>
        <Style TargetType="Grid">
            <Setter Property="Visibility" Value="Collapsed" />
            <Style.Triggers>
                <DataTrigger Binding="{Binding Game, FallbackValue={x:Null}}" Value="{x:Null}">
                    <Setter Property="Visibility" Value="Visible" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Grid.Style>
    <StackPanel HorizontalAlignment="Center" VerticalAlignment="Center" Margin="0,0,0,40">
        <Grid Width="220" Height="170" HorizontalAlignment="Center">
            <Path Data="{DynamicResource IconBurst}" Stretch="Fill" Fill="{DynamicResource HeadingMarkerBrush}" Stroke="{DynamicResource PanelShadowBrush}" StrokeThickness="3" />
            <Path Data="M34,44 L190,36 200,112 116,120 86,150 92,122 26,126Z" Fill="{DynamicResource PanelShadowBrush}" Margin="6,6,0,0" />
            <Path Data="M34,44 L190,36 200,112 116,120 86,150 92,122 26,126Z" Fill="{DynamicResource TextBrush}" Stroke="{DynamicResource PanelShadowBrush}" StrokeThickness="4" />
            <StackPanel Orientation="Horizontal" HorizontalAlignment="Center" VerticalAlignment="Top" Margin="0,72,8,0">
${ind(beatDot('BeatA', '0:0:0'), 16)}
${ind(beatDot('BeatB', '0:0:0.46'), 16)}
${ind(beatDot('BeatC', '0:0:0.92'), 16)}
            </StackPanel>
        </Grid>
        <TextBlock Text="{DynamicResource LOCErrorNoGameSelected}" HorizontalAlignment="Center" Margin="0,22,0,0"
                   FontFamily="{DynamicResource HeadingFontFamily}" FontStyle="Italic" FontSize="{DynamicResource FontSizeLarger}"
                   Foreground="{DynamicResource TextBrush}" />
    </StackPanel>
</Grid>`;

const ns = `xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"`;

const contentStyle = `<Style TargetType="StackPanel">
    <Style.Triggers>
        <DataTrigger Binding="{Binding Game, FallbackValue={x:Null}}" Value="{x:Null}">
            <Setter Property="Visibility" Value="Collapsed" />
        </DataTrigger>
    </Style.Triggers>
</Style>`;

const columns = `<Grid.ColumnDefinitions>
    <ColumnDefinition Width="*" />
    <ColumnDefinition Width="28" />
    <ColumnDefinition Width="Auto" />
</Grid.ColumnDefinitions>`;

const details = `<!--
    Backbeat: game page, details view. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Skeleton (src/themes/AGENTS.md -> Game page): banner (GameBannerHeight, default 340), halftone in its top-right corner;
    spacer x * 150 / 340 (28 with no banner); headline title over a hard ink copy with the actions (Play 150x40, More and Edit
    40x40 icon squares with tooltips, always visible); a slanted white panel cut; screenshots, description and notes on the
    left and the comic-panel metadata card on the right (GameDetailsPaneWidth, 300). Structure: Playnite Default 10.60.
-->
<ResourceDictionary ${ns}>
    <Style TargetType="DetailsViewGameOverview">
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="DetailsViewGameOverview">
                    <ScrollViewer x:Name="PART_ScrollViewHost" Visibility="Visible" HorizontalScrollBarVisibility="Disabled" VerticalScrollBarVisibility="Auto">
                        <Grid x:Name="PageRoot" Background="{DynamicResource GameOverviewBackgroundBrush}" UseLayoutRounding="True">
${ind(heroArt, 28)}
                            <StackPanel Margin="30,0,34,34">
                                <StackPanel.Style>
${ind(contentStyle, 36)}
                                </StackPanel.Style>
${ind(spacer('x * 150 / 340', 28), 32)}
                                <DockPanel Margin="0,12,0,16">
${ind(actions('16,0,0,0').replace('<StackPanel Orientation="Horizontal"', '<StackPanel Orientation="Horizontal" DockPanel.Dock="Right" VerticalAlignment="Center"'), 36)}
${ind(title, 36)}
                                </DockPanel>
${ind(panelCut, 32)}
                                <Grid Margin="0,16,0,0">
${ind(columns, 36)}
${ind(textColumn, 36)}
${ind(pane('side', 'GameDetailsPaneWidth', '18,16,18,18').replace('<Grid VerticalAlignment=', '<Grid Grid.Column="2" VerticalAlignment='), 36)}
                                </Grid>
                            </StackPanel>
${ind(emptyState, 28)}
                        </Grid>
                    </ScrollViewer>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;

const gridView = `<!--
    Backbeat: grid side panel. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Same skeleton as the details view, narrower: banner, spacer x * 120 / 340 (52 with no banner, room for the close button),
    headline title, actions under it, then text left and the comic-panel metadata card right (GridDetailsPaneWidth, 300 content
    width). Close (CloseGameSideBarCommand) sits over the top-right corner. Structure: Playnite Default 10.60.
-->
<ResourceDictionary ${ns}>
    <Style TargetType="GridViewGameOverview">
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="GridViewGameOverview">
                    <Border BorderBrush="{DynamicResource FrameBrush}">
                        <Border.Style>
                            <Style TargetType="Border">
                                <Setter Property="BorderThickness" Value="3,0,0,0" />
                                <Style.Triggers>
                                    <DataTrigger Binding="{Settings GridViewDetailsPosition}" Value="Left">
                                        <Setter Property="BorderThickness" Value="0,0,3,0" />
                                    </DataTrigger>
                                    <DataTrigger Binding="{Settings ShowPanelSeparators}" Value="False">
                                        <Setter Property="BorderThickness" Value="0" />
                                    </DataTrigger>
                                </Style.Triggers>
                            </Style>
                        </Border.Style>
                        <Grid>
                            <ScrollViewer x:Name="PART_ScrollViewHost" HorizontalScrollBarVisibility="Disabled" VerticalScrollBarVisibility="Auto">
                                <Grid x:Name="PageRoot" Background="{DynamicResource GameOverviewBackgroundBrush}" UseLayoutRounding="True">
${ind(heroArt, 36)}
                                    <StackPanel Margin="24,0,30,30">
                                        <StackPanel.Style>
${ind(contentStyle, 44)}
                                        </StackPanel.Style>
${ind(spacer('x * 120 / 340', 52), 40)}
                                        <StackPanel Margin="0,10,0,16">
${ind(title, 44)}
${ind(actions('0,14,0,0'), 44)}
                                        </StackPanel>
${ind(panelCut, 40)}
                                        <Grid Margin="0,16,0,0">
${ind(columns, 44)}
${ind(textColumn, 44)}
${ind(pane('stack', 'GridDetailsPaneWidth', '16,14,16,16').replace('<Grid VerticalAlignment=', '<Grid Grid.Column="2" VerticalAlignment='), 44)}
                                        </Grid>
                                    </StackPanel>
${ind(emptyState, 36)}
                                </Grid>
                            </ScrollViewer>
                            <Button HorizontalAlignment="Right" VerticalAlignment="Top" Margin="0,12,20,0" Width="34" Height="34" Padding="0"
                                    Focusable="False" Cursor="Hand" ToolTip="{DynamicResource LOCCloseLabel}"
                                    Command="{MainViewModel CloseGameSideBarCommand}">
                                <ContentControl Content="{DynamicResource IconWindowClose}" ContentTemplate="{DynamicResource IconTemplate}"
                                                Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
                            </Button>
                        </Grid>
                    </Border>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;

writeFileSync(join(out, 'Views', 'DetailsViewGameOverview.xaml'), details);
writeFileSync(join(out, 'Views', 'GridViewGameOverview.xaml'), gridView);
console.log('wrote both overviews');
