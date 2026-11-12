// Writes src/Views/DetailsViewGameOverview.xaml and GridViewGameOverview.xaml from one set of fragments, then applies the
// repo's responsive breakpoints (scripts/game-page-breakpoints.mjs) to both.
//
//   node art/gen-overviews.mjs
//
// The game page is the open quest book: the dark void page carries a title in carved caps, a thorn rule, the Steam
// screenshots, and then two parchment pages side by side (or stacked when narrow): the left page is the description
// and the notes, the right page is the metadata (every field, six groups divided by the thorn rule). Each page is parchment
// with a burnt edge and the hand-inked rope frame in ink; text on a page is ink (Parchment* brushes), chips are ink plates.
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyGamePageBreakpoints } from '../../../../scripts/game-page-breakpoints.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const views = join(here, '..', 'src', 'Views');

// ---------------------------------------------------------------------------------------------- metadata model
const G = {
  progress: ['MetaProgress', [
    ['CompletionStatus', 'LOCCompletionStatus', 'button', 'PART_ButtonCompletionStatus'],
    ['PlayTime', 'LOCTimePlayed', 'text', 'PART_TextPlayTime'],
    ['LastPlayed', 'LOCLastPlayed', 'text', 'PART_TextLastActivity'],
    ['RecentActivity', 'LOCRecentActivityLabel', 'text', 'PART_TextRecentActivity'],
    ['Added', 'LOCDateAddedLabel', 'text', 'PART_TextAdded'],
  ]],
  scores: ['MetaScores', [
    ['CommunityScore', 'LOCCommunityScore', 'score', 'PART_TextCommunityScore'],
    ['CriticScore', 'LOCCriticScore', 'score', 'PART_TextCriticScore'],
    ['UserScore', 'LOCUserScore', 'score', 'PART_TextUserScore'],
  ]],
  about: ['MetaAbout', [
    ['Developers', 'LOCDeveloperLabel', 'items', 'PART_ItemsDevelopers'],
    ['Publishers', 'LOCPublisherLabel', 'items', 'PART_ItemsPublishers'],
    ['ReleaseDate', 'LOCGameReleaseDateTitle', 'button', 'PART_ButtonReleaseDate'],
    ['Series', 'LOCSeriesLabel', 'items', 'PART_ItemsSeries'],
    ['AgeRating', 'LOCAgeRatingLabel', 'items', 'PART_ItemsAgeRatings'],
    ['Region', 'LOCRegionLabel', 'items', 'PART_ItemsRegions'],
  ]],
  tags: ['MetaTags', [
    ['Platform', 'LOCPlatformTitle', 'chips', 'PART_ItemsPlatforms'],
    ['Genres', 'LOCGenreLabel', 'chips', 'PART_ItemsGenres'],
    ['Categories', 'LOCGameCategoriesTitle', 'chips', 'PART_ItemsCategories'],
    ['Features', 'LOCFeaturesLabel', 'chips', 'PART_ItemsFeatures'],
    ['Tags', 'LOCTagsLabel', 'chips', 'PART_ItemsTags'],
  ]],
  library: ['MetaLibrary', [
    ['Library', 'LOCGameProviderTitle', 'button', 'PART_ButtonLibrary'],
    ['Source', 'LOCSourceLabel', 'button', 'PART_ButtonSource'],
    ['Version', 'LOCVersionLabel', 'button', 'PART_ButtonVersion'],
    ['InstallSize', 'LOCInstallSizeLabel', 'text', 'PART_TextInstallSize'],
    ['InstallDirectory', 'LOCGameInstallDirTitle', 'button', 'PART_ButtonInstallDirectory'],
  ]],
  links: ['MetaLinks', [
    ['Links', 'LOCLinksLabel', 'items', 'PART_ItemsLinks'],
  ]],
};

function value(kind, part, col) {
  const c = col ? ` Grid.Column="2"` : '';
  switch (kind) {
    case 'text':
      return `<TextBlock${c} x:Name="${part}" TextWrapping="Wrap" Foreground="{DynamicResource ParchmentTextBrush}" />`;
    case 'score':
      return `<TextBlock${c} x:Name="${part}" Style="{DynamicResource TextBlockGameScore}" HorizontalAlignment="Left" />`;
    case 'button':
      return `<Button${c} x:Name="${part}" HorizontalAlignment="Left" Style="{StaticResource PropertyItemButton}" Foreground="{DynamicResource ParchmentLinkBrush}" />`;
    case 'chips':
      return `<ItemsControl${c} x:Name="${part}" Tag="Chip"><ItemsControl.ItemsPanel><ItemsPanelTemplate><WrapPanel /></ItemsPanelTemplate></ItemsControl.ItemsPanel></ItemsControl>`;
    default:
      return `<ItemsControl${c} x:Name="${part}" />`;
  }
}

const CAPTION = 'FontFamily="{DynamicResource UIFontFamily}" FontWeight="Medium" FontSize="14" Foreground="{DynamicResource ParchmentLabelBrush}" TextWrapping="Wrap"';

function row(view, [field, loc, kind, part]) {
  if (view === 'Details') {
    return `<DockPanel x:Name="PART_Elem${field}" Margin="0,8,0,8">
  <TextBlock DockPanel.Dock="Left" Width="118" Text="{DynamicResource ${loc}}" ${CAPTION} Margin="0,3,14,0" />
  ${value(kind, part, false)}
</DockPanel>`;
  }
  return `<Grid x:Name="PART_Elem${field}" Margin="0,8,0,8">
  <Grid.ColumnDefinitions><ColumnDefinition Width="2*" /><ColumnDefinition Width="12" /><ColumnDefinition Width="3*" /></Grid.ColumnDefinitions>
  <TextBlock Text="{DynamicResource ${loc}}" ${CAPTION} Margin="0,3,0,0" VerticalAlignment="Top" />
  ${value(kind, part, true)}
</Grid>`;
}

// A group is one Border: its top rule is the thorn rule (a tiled mask) drawn in the Border's top padding, so the first
// group's rule is clipped away by the viewport (the host's negative top margin) and no stray rule shows.
function group(view, key) {
  const [name, fields] = G[key];
  const prefix = view;
  const names = fields.map(f => `PART_Elem${f[0]}`);
  const triggers = names.length === 1
    ? `<DataTrigger Binding="{Binding Visibility, ElementName=${names[0]}}" Value="Collapsed"><Setter Property="Visibility" Value="Collapsed" /></DataTrigger>`
    : `<MultiDataTrigger><MultiDataTrigger.Conditions>${names.map(n => `<Condition Binding="{Binding Visibility, ElementName=${n}}" Value="Collapsed" />`).join('')}</MultiDataTrigger.Conditions><Setter Property="Visibility" Value="Collapsed" /></MultiDataTrigger>`;
  return `<Border x:Name="${name}" Margin="0,12,0,0" Padding="0,22,0,0">
<Border.Style><Style TargetType="Border"><Style.Triggers>${triggers}</Style.Triggers></Style></Border.Style>
<Grid>
<Rectangle Height="14" VerticalAlignment="Top" Margin="0,-22,0,0" IsHitTestVisible="False" Fill="{DynamicResource ParchmentEdgeBrush}" Opacity="0.85">
<Rectangle.OpacityMask><ImageBrush ImageSource="{ThemeFile 'Images/fx/thorn-tile.png'}" Viewport="0,0,48,14" ViewportUnits="Absolute" TileMode="Tile" /></Rectangle.OpacityMask>
</Rectangle>
<StackPanel>
${fields.map(f => row(view, f)).join('\n')}
</StackPanel>
</Grid>
</Border>`;
}

// ---------------------------------------------------------------------------------------------- pages
const heading = (loc, onPaper = true) => `<StackPanel Margin="0,0,0,12">
<TextBlock Style="{DynamicResource HeadingTextBlock}" Text="{DynamicResource ${loc}}"${onPaper ? ' Foreground="{DynamicResource ParchmentTitleBrush}"' : ''} />
<Control Template="{DynamicResource DividerTemplate}" IsTabStop="False" Focusable="False" Margin="0,4,0,0" Opacity="0.75" Foreground="{DynamicResource ${onPaper ? 'ParchmentTitleBrush' : 'HeadingRuleBrush'}}" />
</StackPanel>`;

// Parchment page: paper, a burnt edge (a radial mask over the edge brush), the inked rope frame, then padded content.
const page = (content, padding, extraName = '') => `<Grid${extraName}>
<Border Background="{DynamicResource ParchmentBrush}" CornerRadius="6" />
<Rectangle IsHitTestVisible="False" Fill="{DynamicResource ParchmentEdgeBrush}" RadiusX="6" RadiusY="6">
<Rectangle.OpacityMask><RadialGradientBrush Center="0.5,0.5" RadiusX="0.78" RadiusY="0.78"><GradientStop Color="#00000000" Offset="0.5" /><GradientStop Color="#99000000" Offset="1" /></RadialGradientBrush></Rectangle.OpacityMask>
</Rectangle>
<Control Template="{DynamicResource InkFrameTemplate}" IsTabStop="False" Focusable="False" Margin="2" Foreground="{DynamicResource ParchmentTitleBrush}" Opacity="0.9" />
<Border Padding="${padding}">
${content}
</Border>
</Grid>`;

const hideWith = name => `<Grid.Style><Style TargetType="Grid"><Style.Triggers><DataTrigger Binding="{Binding Visibility, ElementName=${name}}" Value="Collapsed"><Setter Property="Visibility" Value="Collapsed" /></DataTrigger></Style.Triggers></Style></Grid.Style>`;

function descriptionPage(view, padding) {
  const inner = `<StackPanel x:Name="PART_ElemDescription">
${heading('LOCGameDescriptionTitle')}
<HtmlTextView x:Name="PART_HtmlDescription"
              TextElement.Foreground="{DynamicResource ParchmentTextBrush}"
              Tag="{DynamicResource ParchmentLinkBrush}"
              HtmlFontSize="{DynamicResource FontSize}"
              HtmlFontFamily="{DynamicResource FontFamily}"
              HtmlForeground="{Binding (TextElement.Foreground).Color, RelativeSource={RelativeSource Self}}"
              LinkForeground="{Binding Tag.Color, RelativeSource={RelativeSource Self}}"
              ScrollViewer.HorizontalScrollBarVisibility="Disabled"
              ScrollViewer.VerticalScrollBarVisibility="Disabled"
              pbeh:FocusBahaviors.BlockBringIntoViewRequest="True" />
</StackPanel>`;
  return page(inner, padding).replace(/^<Grid>/, `<Grid Margin="0,0,0,24">${hideWith('PART_ElemDescription')}`);
}

function notesPage(view, padding) {
  const inner = `<StackPanel x:Name="PART_ElemNotes">
${heading('LOCNotesLabel')}
<TextBox x:Name="PART_TextNotes" Style="{DynamicResource BareTextBox}" IsReadOnly="True" BorderThickness="0" Padding="0"
         Foreground="{DynamicResource ParchmentTextBrush}" Background="{DynamicResource ControlBackgroundBrush}"
         AcceptsReturn="True" TextWrapping="Wrap" />
</StackPanel>`;
  return page(inner, padding).replace(/^<Grid>/, `<Grid Margin="0,0,0,24">${hideWith('PART_ElemNotes')}`);
}

function metadataPage(view, padding) {
  const width = view === 'Details' ? 'GameDetailsPaneWidth' : 'GridDetailsPaneWidth';
  const inner = `<StackPanel>
<StackPanel.Resources>
<Style TargetType="Button" BasedOn="{StaticResource PropertyItemButton}"><Setter Property="Foreground" Value="{DynamicResource ParchmentLinkBrush}" /></Style>
</StackPanel.Resources>
${heading('LOCGameDetails')}
<Border x:Name="${view}MetadataViewport" ClipToBounds="True" HorizontalAlignment="Stretch" Width="{DynamicResource ${width}}">
<StackPanel x:Name="${view}MetadataGroupsHost" Margin="0,-34,0,-8">
${['progress', 'scores', 'about', 'tags', 'library', 'links'].map(k => group(view, k)).join('\n')}
</StackPanel>
</Border>
</StackPanel>`;
  return page(inner, padding);
}

// Steam Screenshots: same gate, skeleton and 12 s loading window in both views (reference.md -> Steam screenshots).
const steam = () => `<Grid x:Name="SteamScreenshotsGameScope" Margin="0,0,0,24">
<Grid.Style>
<Style TargetType="Grid">
<Setter Property="Visibility" Value="Collapsed" />
<Style.Triggers>
<DataTrigger Binding="{Binding Game.PluginId}" Value="cb91dfc9-b977-43bf-8e70-55f46e410fab"><Setter Property="Visibility" Value="Visible" /></DataTrigger>
<DataTrigger Binding="{Binding Game.Source.Name}" Value="Steam"><Setter Property="Visibility" Value="Visible" /></DataTrigger>
</Style.Triggers>
</Style>
</Grid.Style>
<Grid>
<Grid.Style>
<Style TargetType="Grid">
<Setter Property="Visibility" Value="Collapsed" />
<Style.Triggers>
<DataTrigger Binding="{PluginSettings Plugin=SteamScreenshots, Path=IsControlVisible, FallbackValue=PluginUnavailable}" Value="True"><Setter Property="Visibility" Value="Visible" /></DataTrigger>
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
<MultiDataTrigger.ExitActions><RemoveStoryboard BeginStoryboardName="SteamScreenshotsLoading" /></MultiDataTrigger.ExitActions>
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
<MultiDataTrigger.ExitActions><RemoveStoryboard BeginStoryboardName="SteamScreenshotsLoadingSource" /></MultiDataTrigger.ExitActions>
</MultiDataTrigger>
</Style.Triggers>
</Style>
</Grid.Style>
<StackPanel>
${heading('LOC_SteamScreenshots_SteamScreenshotsLabel', false)}
<Grid>
<ContentControl x:Name="SteamScreenshots_SteamScreenshotsViewControl" />
<Control Template="{DynamicResource SteamScreenshotsSkeletonTemplate}" Foreground="{DynamicResource TextBrushDarker}" Focusable="False" IsTabStop="False" IsHitTestVisible="False">
<Control.Style>
<Style TargetType="Control">
<Setter Property="Visibility" Value="Collapsed" />
<Style.Triggers>
<DataTrigger Binding="{PluginSettings Plugin=SteamScreenshots, Path=IsControlVisible, FallbackValue=PluginUnavailable}" Value="False"><Setter Property="Visibility" Value="Visible" /></DataTrigger>
</Style.Triggers>
</Style>
</Control.Style>
</Control>
</Grid>
</StackPanel>
</Grid>
</Grid>`;

// ---------------------------------------------------------------------------------------------- banner, header, empty state
const banner = () => `<Grid x:Name="HeroArt" Height="{DynamicResource GameBannerHeight}" VerticalAlignment="Top" ClipToBounds="True" IsHitTestVisible="False">
<Grid.Style>
<Style TargetType="Grid">
<Style.Triggers>
<DataTrigger Binding="{Binding Source, ElementName=PART_ImageBackground}" Value="{x:Null}"><Setter Property="Visibility" Value="Collapsed" /></DataTrigger>
<DataTrigger Binding="{Binding Visibility, ElementName=PART_ImageBackground}" Value="Collapsed"><Setter Property="Visibility" Value="Collapsed" /></DataTrigger>
    <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
      <Setter Property="Visibility" Value="Collapsed" />
    </DataTrigger>
</Style.Triggers>
</Style>
</Grid.Style>
<FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill" HorizontalAlignment="Center" VerticalAlignment="Center" />
<Rectangle Fill="{DynamicResource GameBannerTintBrush}" Opacity="{DynamicResource GameBannerDarken}" IsHitTestVisible="False" />
<!-- banner darkening floor: any value above 0 starts at 50%, so the result is 50% + 50% x the slider -->
<Rectangle Fill="{DynamicResource GameBannerTintBrush}" Opacity="0.5" Tag="{DynamicResource GameBannerDarken}" IsHitTestVisible="False">
    <Rectangle.Style>
        <Style TargetType="Rectangle">
            <Style.Triggers>
                <DataTrigger Binding="{Binding Tag, RelativeSource={RelativeSource Self}}" Value="0">
                    <Setter Property="Visibility" Value="Collapsed" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Rectangle.Style>
</Rectangle>
<!-- The art is toned toward the book's plum night and faded into the page by plain gradients: no OpacityMask on the banner, which left dark seams behind the animated Play button on scaled displays. -->
<Border Background="{DynamicResource ArtTintBrush}" />
<Border Background="{DynamicResource ScrimBrush}" Opacity="0.4" />
<Rectangle>
<Rectangle.Fill>
<LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
<GradientStop Color="#00000000" Offset="0.2" />
<GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="0.96" />
</LinearGradientBrush>
</Rectangle.Fill>
</Rectangle>
</Grid>`;

const spacer = (name, ratio, floor) => `<Border IsHitTestVisible="False" x:Name="${name}" MinHeight="${floor}">
<Border.Style>
<Style TargetType="Border">
<Setter Property="Height" Value="{Binding ActualHeight, ElementName=HeroArt, Converter={StaticResource MathConverter}, ConverterParameter='x * ${ratio}'}" />
<Style.Triggers>
<DataTrigger Binding="{Binding ActualHeight, ElementName=HeroArt}" Value="0"><Setter Property="Height" Value="${floor}" /></DataTrigger>
<DataTrigger Binding="{Binding Visibility, ElementName=HeroArt}" Value="Collapsed"><Setter Property="Height" Value="${floor}" /></DataTrigger>
</Style.Triggers>
</Style>
</Border.Style>
</Border>`;

const iconBtn = (name, tip, icon) => `<Button x:Name="${name}" Width="42" Height="42" Padding="0" Style="{DynamicResource SecondaryButton}" ToolTip="{DynamicResource ${tip}}">
<ContentControl Width="18" Height="18" Focusable="False" IsTabStop="False" Content="{DynamicResource ${icon}}" ContentTemplate="{DynamicResource IconTemplate}" />
</Button>`;

const title = size => `<TextBlock x:Name="PART_TextDisplayName" TextWrapping="Wrap" VerticalAlignment="Center" FontFamily="{DynamicResource HeadingFontFamily}" FontWeight="Bold" FontSize="${size}" Foreground="{DynamicResource HeadingForegroundBrush}" />`;

const empty = (viewportHost, margin) => `<Grid VerticalAlignment="Top" Height="{Binding ViewportHeight, ElementName=${viewportHost}}" IsHitTestVisible="False">
<Grid.Style>
<Style TargetType="Grid">
<Setter Property="Visibility" Value="Collapsed" />
<Style.Triggers>
<DataTrigger Binding="{Binding Game, FallbackValue={x:Null}}" Value="{x:Null}"><Setter Property="Visibility" Value="Visible" /></DataTrigger>
</Style.Triggers>
</Style>
</Grid.Style>
<StackPanel HorizontalAlignment="Center" VerticalAlignment="Center" Margin="${margin}">
<Grid Width="150" Height="130" HorizontalAlignment="Center">
<Rectangle x:Name="EmptyBloom" Width="150" Height="150" Opacity="0.22" Fill="{DynamicResource PrimaryButtonGlowBrush}">
<Rectangle.OpacityMask><ImageBrush ImageSource="{ThemeFile 'Images/fx/mote.png'}" /></Rectangle.OpacityMask>
</Rectangle>
<ContentControl Width="84" Height="84" Focusable="False" IsTabStop="False" Foreground="{DynamicResource TextBrushDarker}" Content="{DynamicResource EmptyGameIcon}" ContentTemplate="{DynamicResource IconTemplate}"><ContentControl.LayoutTransform><ScaleTransform ScaleX="3" ScaleY="3" /></ContentControl.LayoutTransform></ContentControl>
<Rectangle x:Name="EmptySpark" Width="22" Height="22" HorizontalAlignment="Center" VerticalAlignment="Top" Margin="40,-4,0,0" Opacity="0.5" Fill="{DynamicResource FocusBrush}">
<Rectangle.OpacityMask><ImageBrush ImageSource="{ThemeFile 'Images/fx/mote.png'}" /></Rectangle.OpacityMask>
</Rectangle>
</Grid>
<TextBlock Text="{DynamicResource LOCErrorNoGameSelected}" HorizontalAlignment="Center" Margin="0,10,0,0" FontFamily="{DynamicResource HeadingFontFamily}" FontWeight="SemiBold" FontSize="24" Foreground="{DynamicResource TextBrushDarker}" />
<Control Template="{DynamicResource DividerTemplate}" IsTabStop="False" Focusable="False" Width="240" Margin="0,8,0,0" Foreground="{DynamicResource HeadingRuleBrush}" />
</StackPanel>
</Grid>`;

// The wand spark drifts and breathes while the empty page shows. It lives in the page template's triggers (the page is built
// with no game yet, so a Style trigger on a transform would crash Playnite); only plain properties are animated.
const emptyLoop = `<ControlTemplate.Triggers>
<DataTrigger Binding="{Binding Game, FallbackValue={x:Null}}" Value="{x:Null}">
<DataTrigger.EnterActions>
<BeginStoryboard x:Name="EmptyLoop">
<Storyboard RepeatBehavior="Forever" AutoReverse="True">
<DoubleAnimation Storyboard.TargetName="EmptySpark" Storyboard.TargetProperty="Opacity" From="0.35" To="1" Duration="0:0:1.6"><DoubleAnimation.EasingFunction><SineEase EasingMode="EaseInOut" /></DoubleAnimation.EasingFunction></DoubleAnimation>
<ThicknessAnimation Storyboard.TargetName="EmptySpark" Storyboard.TargetProperty="Margin" From="40,-4,0,0" To="-30,10,0,0" Duration="0:0:2.4"><ThicknessAnimation.EasingFunction><SineEase EasingMode="EaseInOut" /></ThicknessAnimation.EasingFunction></ThicknessAnimation>
<DoubleAnimation Storyboard.TargetName="EmptyBloom" Storyboard.TargetProperty="Opacity" From="0.14" To="0.3" Duration="0:0:2.4"><DoubleAnimation.EasingFunction><SineEase EasingMode="EaseInOut" /></DoubleAnimation.EasingFunction></DoubleAnimation>
</Storyboard>
</BeginStoryboard>
</DataTrigger.EnterActions>
<DataTrigger.ExitActions><RemoveStoryboard BeginStoryboardName="EmptyLoop" /></DataTrigger.ExitActions>
</DataTrigger>
</ControlTemplate.Triggers>`;

const NS = `xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
                    xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
                    xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
                    xmlns:pbeh="clr-namespace:Playnite.Behaviors;assembly=Playnite"
                    mc:Ignorable="d"`;

// ---------------------------------------------------------------------------------------------- details view
// Body = the two branches the breakpoint tool needs: main column (screenshots, description, notes), metadata page.
function body(view, pad) {
  return `<Grid>
<StackPanel>
${steam()}
${descriptionPage(view, pad)}
${notesPage(view, pad)}
</StackPanel>
<Grid Margin="24,0,0,0" VerticalAlignment="Top">
${metadataPage(view, pad)}
</Grid>
</Grid>`;
}

function detailsFile() {
  const pad = '42,42,42,42';
  return `<!--
    Hallowtide: the game page (details view) as the open quest book. Dark plum page, the game's art toned into it as a banner,
    the title in carved caps (Cinzel Bold) with the thorn rule under it, Play as the torn parchment plate lit by the lantern,
    More and Edit as ink squares. Below: Steam screenshots, then two parchment pages: description and notes on the left, every
    metadata field on the right in six groups split by the thorn rule. Text on a page is ink. Generated by art/gen-overviews.mjs.
-->
<ResourceDictionary ${NS}>

    <Style TargetType="{x:Type DetailsViewGameOverview}">
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="{x:Type DetailsViewGameOverview}">
                    <ScrollViewer x:Name="PART_ScrollViewHost" HorizontalScrollBarVisibility="Disabled" VerticalScrollBarVisibility="Visible"
                                  Style="{DynamicResource DetailsScrollViewer}" Visibility="Visible"
                                  d:DesignWidth="1280" d:DesignHeight="1280"
                                  d:DataContext="{x:Static DesignMainViewModel.DesignSelectedGameDetailsIntance}">
                        <Grid x:Name="PageRoot">
                            <Grid.Style>
                                <Style TargetType="Grid">
                                    <Setter Property="Background" Value="{DynamicResource GameOverviewBackgroundBrush}" />
                                    <Style.Triggers>
                                        <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                                            <Setter Property="Background" Value="Transparent" />
                                        </DataTrigger>
                                    </Style.Triggers>
                                </Style>
                            </Grid.Style>
${banner()}
<Grid>
<Grid.Style><Style TargetType="Grid"><Style.Triggers><DataTrigger Binding="{Binding Game, FallbackValue={x:Null}}" Value="{x:Null}"><Setter Property="Visibility" Value="Collapsed" /></DataTrigger></Style.Triggers></Style></Grid.Style>
<StackPanel Margin="24,16,41,32" MaxWidth="1100">
<StackPanel.Resources><Style TargetType="TextBlock" BasedOn="{StaticResource BaseTextBlockStyle}"><Setter Property="TextWrapping" Value="Wrap" /></Style></StackPanel.Resources>
${spacer('DetailsBannerSpacer', '100 / 320', 8)}
<DockPanel>
<StackPanel DockPanel.Dock="Right" Orientation="Horizontal" VerticalAlignment="Bottom" Margin="16,0,0,0">
<Grid>
<Button x:Name="PART_ButtonPlayAction" Style="{DynamicResource PlayButton}" />
<Button x:Name="PART_ButtonContextAction" Style="{DynamicResource PlayButton}" />
</Grid>
<Grid Margin="10,0,0,0">${iconBtn('PART_ButtonMoreActions', 'LOCMoreAction', 'IconOptions')}</Grid>
<Grid Margin="8,0,0,0">${iconBtn('PART_ButtonEditGame', 'LOCEditGame', 'IconEdit').replace('<Button ', '<Button Focusable="False" ')}</Grid>
</StackPanel>
<StackPanel VerticalAlignment="Bottom">
<DockPanel>
<Image x:Name="PART_ImageIcon" DockPanel.Dock="Left" MaxWidth="40" MaxHeight="40" Margin="0,0,14,0" VerticalAlignment="Center" RenderOptions.BitmapScalingMode="Fant" />
${title('{DynamicResource FontSizeLargest}')}
</DockPanel>
</StackPanel>
</DockPanel>
<Control Template="{DynamicResource DividerTemplate}" IsTabStop="False" Focusable="False" Margin="0,16,0,26" Foreground="{DynamicResource HeadingRuleBrush}" />
${body('Details', pad)}
</StackPanel>
</Grid>
${empty('PART_ScrollViewHost', '0,0,0,40')}
                        </Grid>
                    </ScrollViewer>
                    ${emptyLoop}
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;
}

// ---------------------------------------------------------------------------------------------- grid view (side panel)
function closeButtonTemplate() {
  return `<Button.Template>
<ControlTemplate TargetType="{x:Type Button}">
<Grid Background="Transparent">
<Border CornerRadius="{DynamicResource ControlCornerRadius}" Background="{DynamicResource ButtonBackgroundBrush}" BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="1" IsHitTestVisible="False" />
<Border x:Name="HoverPlate" CornerRadius="{DynamicResource ControlCornerRadius}" Background="{DynamicResource DangerBrush}" Opacity="0" IsHitTestVisible="False" />
<ContentControl x:Name="Glyph" Width="14" Height="14" HorizontalAlignment="Center" VerticalAlignment="Center" IsHitTestVisible="False" Focusable="False" IsTabStop="False"
                Content="{DynamicResource IconWindowClose}" ContentTemplate="{DynamicResource IconTemplate}" Foreground="{DynamicResource TextBrush}" />
</Grid>
<ControlTemplate.Triggers>
<Trigger Property="IsMouseOver" Value="True">
<Setter TargetName="Glyph" Property="Foreground" Value="{DynamicResource DangerForegroundBrush}" />
<Trigger.EnterActions><BeginStoryboard><Storyboard><DoubleAnimation Storyboard.TargetName="HoverPlate" Storyboard.TargetProperty="Opacity" To="1" Duration="0:0:0.12" /></Storyboard></BeginStoryboard></Trigger.EnterActions>
<Trigger.ExitActions><BeginStoryboard><Storyboard><DoubleAnimation FillBehavior="Stop" Storyboard.TargetName="HoverPlate" Storyboard.TargetProperty="Opacity" To="0" Duration="0:0:0.15" /></Storyboard></BeginStoryboard></Trigger.ExitActions>
</Trigger>
<Trigger Property="IsPressed" Value="True"><Setter TargetName="HoverPlate" Property="Opacity" Value="0.7" /></Trigger>
</ControlTemplate.Triggers>
</ControlTemplate>
</Button.Template>`;
}

function gridFile() {
  const pad = '38,40,38,40';
  return `<!--
    Hallowtide: the game page (grid view side panel). The same quest book page in a narrow panel: the actions sit under the title,
    the close button sits over the top left corner (or inline beside the icon when the banner is under 120px), captions sit
    beside their values (2:3 columns) on the metadata page. Generated by art/gen-overviews.mjs.
-->
<ResourceDictionary ${NS}>

    <Style TargetType="{x:Type GridViewGameOverview}">
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="{x:Type GridViewGameOverview}">
                    <Border x:Name="PageRoot" BorderBrush="{DynamicResource PanelSeparatorBrush}"
                            d:DataContext="{x:Static DesignMainViewModel.DesignSelectedGameDetailsIntance}">
                        <Border.Style>
                            <Style TargetType="Border">
                                <Setter Property="Background" Value="{DynamicResource ContentBackgroundBrush}" />
                                <Setter Property="BorderThickness" Value="1,0,0,0" />
                                <Style.Triggers>
                                    <DataTrigger Binding="{Settings GridViewDetailsPosition}" Value="Left"><Setter Property="BorderThickness" Value="0,0,1,0" /></DataTrigger>
                                    <DataTrigger Binding="{Settings ShowPanelSeparators}" Value="False"><Setter Property="BorderThickness" Value="0" /></DataTrigger>
                                    <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                                        <Setter Property="Background" Value="Transparent" />
                                    </DataTrigger>
                                </Style.Triggers>
                            </Style>
                        </Border.Style>
                        <Grid>
${empty('PART_ScrollViewHost', '0,0,0,40')}
<ScrollViewer CanContentScroll="False" x:Name="PART_ScrollViewHost" HorizontalScrollBarVisibility="Disabled" VerticalScrollBarVisibility="Visible">
<Grid>
<Grid.Style><Style TargetType="Grid"><Style.Triggers><Trigger Property="DataContext" Value="{x:Null}"><Setter Property="Visibility" Value="Collapsed" /></Trigger></Style.Triggers></Style></Grid.Style>
${banner()}
<Grid Margin="24,0,24,24">
<Grid.RowDefinitions><RowDefinition Height="Auto" /><RowDefinition Height="Auto" /><RowDefinition Height="*" /></Grid.RowDefinitions>
${spacer('GridBannerSpacer', '72 / 320', 24).replace('<Border IsHitTestVisible', '<Border Grid.Row="0" IsHitTestVisible')}
<StackPanel Panel.ZIndex="2" Grid.Row="1" Margin="0,0,0,20">
<DockPanel Panel.ZIndex="2">
<Button x:Name="InlineSidePanelCloseButton" DockPanel.Dock="Left" HorizontalAlignment="Left" VerticalAlignment="Center" Margin="0,0,10,0" Width="28" Height="28" Padding="0"
        Focusable="False" Cursor="Hand" ToolTip="{DynamicResource LOCCloseLabel}" Command="{MainViewModel CloseGameSideBarCommand}"
        Template="{Binding Template, ElementName=SidePanelCloseButton}"
        Visibility="{Binding Tag, ElementName=SidePanelCloseButton, Converter={StaticResource MathConverter}, ConverterParameter='x &lt; 120 ? \`Visible\` : \`Collapsed\`'}">
<Button.RenderTransform><TranslateTransform Y="{Binding ContentVerticalOffset, ElementName=PART_ScrollViewHost}" /></Button.RenderTransform>
</Button>
<Image x:Name="PART_ImageIcon" MaxHeight="32" MaxWidth="32" DockPanel.Dock="Left" Margin="0,0,12,0" VerticalAlignment="Center" RenderOptions.BitmapScalingMode="Fant" />
${title('{DynamicResource FontSizeLargest}')}
</DockPanel>
<Control Template="{DynamicResource DividerTemplate}" IsTabStop="False" Focusable="False" Margin="0,12,0,0" Foreground="{DynamicResource HeadingRuleBrush}" />
<Grid Margin="0,16,0,0" Background="Transparent">
<Grid.ColumnDefinitions><ColumnDefinition Width="*" MaxWidth="170" /><ColumnDefinition Width="Auto" /><ColumnDefinition Width="Auto" /></Grid.ColumnDefinitions>
<Grid>
<Button x:Name="PART_ButtonPlayAction" Style="{DynamicResource PlayButton}" />
<Button x:Name="PART_ButtonContextAction" Style="{DynamicResource PlayButton}" />
</Grid>
<Grid Grid.Column="1" Margin="10,0,0,0">${iconBtn('PART_ButtonMoreActions', 'LOCMoreAction', 'IconOptions')}</Grid>
<Grid Grid.Column="2" Margin="8,0,0,0">${iconBtn('PART_ButtonEditGame', 'LOCEditGame', 'IconEdit').replace('<Button ', '<Button Focusable="False" ')}</Grid>
</Grid>
</StackPanel>
<Grid Grid.Row="2">
${body('Grid', pad)}
</Grid>
</Grid>
</Grid>
</ScrollViewer>

<!-- Close (hides the side panel): a plate over the top left corner. Shown when the configured banner is 120px or taller and always when no game is selected. -->
<Button x:Name="SidePanelCloseButton" Tag="{DynamicResource GameBannerHeight}" HorizontalAlignment="Left" VerticalAlignment="Top" Margin="12,12,0,0" Width="28" Height="28" Padding="0"
        Focusable="False" Cursor="Hand" ToolTip="{DynamicResource LOCCloseLabel}" Command="{MainViewModel CloseGameSideBarCommand}">
<Button.Style>
<Style TargetType="Button" BasedOn="{StaticResource {x:Type Button}}">
<Setter Property="Visibility" Value="{Binding Tag, RelativeSource={RelativeSource Self}, Converter={StaticResource MathConverter}, ConverterParameter='x &lt; 120 ? \`Collapsed\` : \`Visible\`'}" />
<Style.Triggers>
<DataTrigger Binding="{Binding Game, FallbackValue={x:Null}}" Value="{x:Null}"><Setter Property="Visibility" Value="Visible" /></DataTrigger>
</Style.Triggers>
</Style>
</Button.Style>
${closeButtonTemplate()}
</Button>
                        </Grid>
                    </Border>
                    ${emptyLoop}
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;
}

// ---------------------------------------------------------------------------------------------- write
const outputs = [
  ['DetailsViewGameOverview.xaml', detailsFile()],
  ['GridViewGameOverview.xaml', gridFile()],
];
for (const [file, text] of outputs) {
  const result = applyGamePageBreakpoints(text);
  writeFileSync(join(views, file), result, 'utf8');
  console.log(`wrote ${file} (${result.length} chars)`);
}
