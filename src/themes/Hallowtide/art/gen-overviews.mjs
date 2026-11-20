// Generates Hallowtide's DetailsViewGameOverview.xaml and GridViewGameOverview.xaml from the shared overview helpers.
// Usage: node src/themes/Hallowtide/art/gen-overviews.mjs
import {
  META_GROUPS,
  bannerDarkeningFloor,
  bannerSpacer,
  collapseEmptyGroupStyle,
  heroVisibilityStyle,
  inlineCloseButton,
  metadataField,
  metadataValue,
  pageRootStyle,
  resolveThemeSrcDir,
  sidePanelCloseButton,
  steamScreenshotsGate,
  writeOverviews,
} from '../../../../scripts/overview-generator.mjs';

const views = resolveThemeSrcDir(import.meta.url);

// ---------------------------------------------------------------------------------------------- metadata rows
const valueOpts = {
  buttonStyleKind: 'StaticResource',
  buttonForeground: 'ParchmentLinkBrush',
  textForeground: 'ParchmentTextBrush',
  textVerticalCenter: false,
  scoreVerticalCenter: false,
  scoreWrap: false,
  itemsWrapPanel: false,
};

const CAPTION = 'FontFamily="{DynamicResource UIFontFamily}" FontWeight="Medium" FontSize="14" Foreground="{DynamicResource ParchmentLabelBrush}" TextWrapping="Wrap"';

function row(view, fieldDef) {
  const [field, loc, kind, part] = fieldDef;
  if (view === 'Details') {
    return `<DockPanel x:Name="PART_Elem${field}" Margin="0,8,0,8">
  <TextBlock DockPanel.Dock="Left" Width="118" Text="{DynamicResource ${loc}}" ${CAPTION} Margin="0,3,14,0" />
  ${metadataValue(kind, part, '', valueOpts)}
</DockPanel>`;
  }
  return metadataField(fieldDef, 'stack', {
    wrapper: 'Grid',
    margin: '0,8,0,8',
    captionFontFamily: 'UIFontFamily',
    captionFontWeight: 'Medium',
    captionFontSize: '14',
    captionForeground: 'ParchmentLabelBrush',
    captionStackMargin: '0,3,0,0',
    valueOptions: valueOpts,
  });
}

// A group is one Border: its top rule is the thorn rule (a tiled mask) drawn in the Border's top padding, so the first
// group's rule is clipped away by the viewport (the host's negative top margin) and no stray rule shows.
function group(view, [name, fields]) {
  const names = fields.map(f => `PART_Elem${f[0]}`);
  return `<Border x:Name="${name}" Margin="0,12,0,0" Padding="0,22,0,0">
${collapseEmptyGroupStyle(names)}
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
${META_GROUPS.map(g => group(view, g)).join('\n')}
</StackPanel>
</Border>
</StackPanel>`;
  return page(inner, padding);
}

// Steam Screenshots: same gate, skeleton and 12 s loading window in both views (reference.md -> Steam screenshots).
const steam = () => steamScreenshotsGate({
  mode: 'storyboard',
  scopeAttrs: ' Margin="0,0,0,24"',
  innerMargin: '',
  heading: heading('LOC_SteamScreenshots_SteamScreenshotsLabel', false),
  includeSourceLoadingTrigger: true,
});

// ---------------------------------------------------------------------------------------------- banner, header, empty state
const banner = () => `<Grid x:Name="HeroArt" Height="{DynamicResource GameBannerHeight}" VerticalAlignment="Top" ClipToBounds="True" IsHitTestVisible="False">
${heroVisibilityStyle({ mode: 'visibility', includeNullGame: false })}
<FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill" HorizontalAlignment="Center" VerticalAlignment="Center" />
${bannerDarkeningFloor()}
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

const spacer = (name, ratio, floor) => bannerSpacer(`x * ${ratio}`, floor, name);

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
<Viewbox Width="96" Height="96" HorizontalAlignment="Center" VerticalAlignment="Center" Stretch="Uniform"><Canvas Width="24" Height="24"><Path Data="{DynamicResource EmptyGameIcon}" StrokeThickness="1.4" StrokeStartLineCap="Round" StrokeEndLineCap="Round" StrokeLineJoin="Round" Stroke="{DynamicResource TextBrushDarker}" /></Canvas></Viewbox>
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
${pageRootStyle()}
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
<Button x:Name="PART_ButtonContextAction" Tag="ContextAction" Style="{DynamicResource PlayButton}" />
<Control Style="{DynamicResource RunningActionIndicator}" />
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
${spacer('GridBannerSpacer', '72 / 320', 24).replace('<Border ', '<Border Grid.Row="0" ')}
<StackPanel Panel.ZIndex="2" Grid.Row="1" Margin="0,0,0,20">
<DockPanel Panel.ZIndex="2">
${inlineCloseButton()}
<Image x:Name="PART_ImageIcon" MaxHeight="32" MaxWidth="32" DockPanel.Dock="Left" Margin="0,0,12,0" VerticalAlignment="Center" RenderOptions.BitmapScalingMode="Fant" />
${title('{DynamicResource FontSizeLargest}')}
</DockPanel>
<Control Template="{DynamicResource DividerTemplate}" IsTabStop="False" Focusable="False" Margin="0,12,0,0" Foreground="{DynamicResource HeadingRuleBrush}" />
<Grid Margin="0,16,0,0" Background="Transparent">
<Grid.ColumnDefinitions><ColumnDefinition Width="*" MaxWidth="170" /><ColumnDefinition Width="Auto" /><ColumnDefinition Width="Auto" /></Grid.ColumnDefinitions>
<Grid>
<Button x:Name="PART_ButtonPlayAction" Style="{DynamicResource PlayButton}" />
<Button x:Name="PART_ButtonContextAction" Tag="ContextAction" Style="{DynamicResource PlayButton}" />
<Control Style="{DynamicResource RunningActionIndicator}" />
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
${sidePanelCloseButton({ preset: 'plate', comment: '' })}
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
writeOverviews(views, detailsFile(), gridFile());
