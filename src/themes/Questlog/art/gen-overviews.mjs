// Generates Questlog's DetailsViewGameOverview.xaml and GridViewGameOverview.xaml from the shared overview helpers.
// Usage: node src/themes/Questlog/art/gen-overviews.mjs
import {
  bannerDarkeningFloor,
  bannerSpacer,
  heroVisibilityStyle,
  hideWhenNoGame,
  indent,
  inlineCloseButton,
  metaGroups,
  metadataGroup,
  pageRootStyle,
  resolveThemeSrcDir,
  sidePanelCloseButton,
  steamScreenshotsGate,
  writeOverviews,
} from '../../../../scripts/overview-generator.mjs';

const VIEWS = resolveThemeSrcDir(import.meta.url);
const GROUPS = metaGroups({ plural: true });
const NO_GAME = '{Binding Game, FallbackValue={x:Null}}';

// A panel heading: gold, like the names on the client's info panels, over a faint rule.
const heading = (key) => `<TextBlock Text="{DynamicResource ${key}}" FontSize="{DynamicResource FontSizeLarger}" FontFamily="{DynamicResource HeadingFontFamily}" FontWeight="SemiBold"
           Style="{DynamicResource BaseTextBlockStyle}" Foreground="{DynamicResource GlyphBrush}" />
<Rectangle Height="1" Margin="0,6,0,10" IsHitTestVisible="False" Opacity="0.3" Fill="{DynamicResource PopupBorderBrush}" />`;

// An info panel: the tooltip backdrop inside a metal line with a black line inside it.
function panel(inner, attrs = '', name = '', style = '', padding = '18,14,18,16') {
  const n = name ? ` x:Name="${name}"` : '';
  const st = style ? `\n${indent(style, 4)}` : '';
  return `<Border${n}${attrs} SnapsToDevicePixels="True"
        Background="{DynamicResource TooltipBackgroundBrush}"
        BorderBrush="{DynamicResource PopupBorderBrush}"
        BorderThickness="{DynamicResource PopupBorderThickness}"
        CornerRadius="{DynamicResource CornerRadiusLarge}">${st}
    <Border BorderBrush="{DynamicResource FrameInnerBrush}" BorderThickness="1" Padding="${padding}"
            CornerRadius="{DynamicResource ControlCornerRadius}">
${indent(inner, 8)}
    </Border>
</Border>`;
}

const fieldValueOptions = {
  buttonStyleKind: 'StaticResource',
  textStyle: 'BaseTextBlockStyle',
  textVerticalCenter: false,
  scoreVerticalCenter: false,
  scoreWrap: false,
  itemsWrapPanel: false,
  chipsMargin: '0,0,0,-5',
};

function detailsPanel(grid, attrs) {
  const width = grid ? 'GridDetailsPaneWidth' : 'GameDetailsPaneWidth';
  const layout = grid ? 'stack' : 'side';
  const fieldOptions = grid
    ? {
        wrapper: 'Grid',
        margin: '0,6,0,6',
        stackColumn: '1',
        stackGap: '',
        captionStyle: 'BaseTextBlockStyle',
        captionFontSize: '',
        captionForeground: 'GlyphBrush',
        captionStackMargin: '0,0,12,0',
        valueOptions: fieldValueOptions,
      }
    : {
        wrapper: 'Grid',
        margin: '0,6,0,6',
        sideColumnWidth: '132',
        sideValueWrapper: false,
        captionStyle: 'BaseTextBlockStyle',
        captionFontSize: '',
        captionForeground: 'GlyphBrush',
        captionSideMargin: '0,0,8,0',
        valueOptions: fieldValueOptions,
      };
  const groups = GROUPS.map(g => metadataGroup(g, layout, {
    margin: '0,0,0,14',
    padding: '',
    borderThickness: '',
    borderBrush: '',
    basedOn: '{StaticResource {x:Type Border}}',
    fieldOptions,
  })).join('\n');
  const inner = `<StackPanel Width="{DynamicResource ${width}}">
${indent(heading('LOCGameDetails'), 4)}
    <StackPanel Margin="0,-6,0,-20">
${indent(groups, 8)}
    </StackPanel>
</StackPanel>`;
  return panel(inner, attrs, '', '', '14,12,14,14');
}

// Left column: screenshots and description in one info panel, the notes as a letter on paper under it.
function textColumn(attrs) {
  const shots = steamScreenshotsGate({
    mode: 'storyboard',
    hostName: 'ShotsHost',
    innerMargin: '0,0,0,18',
    heading: heading('LOC_SteamScreenshots_SteamScreenshotsLabel'),
    skeletonForeground: 'TextBrush',
    includeSourceLoadingTrigger: true,
  });
  const description = `<StackPanel Name="PART_ElemDescription">
${indent(heading('LOCGameDescriptionTitle'), 4)}
    <HtmlTextView Name="PART_HtmlDescription"
                  HtmlFontSize="{DynamicResource FontSize}"
                  HtmlFontFamily="{DynamicResource FontFamily}"
                  ScrollViewer.HorizontalScrollBarVisibility="Disabled"
                  ScrollViewer.VerticalScrollBarVisibility="Disabled"
                  pbeh:FocusBahaviors.BlockBringIntoViewRequest="True" />
</StackPanel>`;
  // The panel goes away when it has nothing to hold (no description and no screenshots).
  const hide = `<Border.Style>
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
</Border.Style>`;
  const info = panel(`<StackPanel>
${indent(shots, 4)}
${indent(description, 4)}
</StackPanel>`, '', 'TextPanel', hide);
  const notes = `<!-- Notes: a letter. Ink on the tiled paper with a shaded rim, in a black line. -->
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
</StackPanel>`;
  return `<StackPanel${attrs} VerticalAlignment="Top">
${indent(info, 4)}
${indent(notes, 4)}
</StackPanel>`;
}

// Banner: the game's background art as a band at the top, GameBannerHeight high (0 turns it off). No OpacityMask
// here: masked art repainted in part behind the animated Play button leaves dark seams on scaled displays. A plain
// black scrim darkens it toward the title and a second gradient fades it into the page color, read from PageRoot.
const HERO = `<Grid x:Name="HeroArt" Height="{DynamicResource GameBannerHeight}" VerticalAlignment="Top" ClipToBounds="True" IsHitTestVisible="False">
${indent(heroVisibilityStyle({ mode: 'visibility', includeNullGame: false }), 4)}
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill"
               HorizontalAlignment="Center" VerticalAlignment="Center" />
${indent(bannerDarkeningFloor(), 4)}
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
</Grid>`;

// An image in an item slot: the bevelled slot edge round the black bed; hidden with the image.
function slot(image, margin) {
  const name = image.split('"')[1];
  return `<Border${margin} VerticalAlignment="Center" SnapsToDevicePixels="True"
        Visibility="{Binding Visibility, ElementName=${name}}"
        BorderBrush="{DynamicResource SlotBorderBrush}" BorderThickness="1"
        Background="{DynamicResource GridItemBackgroundBrush}"
        CornerRadius="{DynamicResource ControlCornerRadius}">
    ${image}
</Border>`;
}

const title = (extra = '') => `<TextBlock Name="PART_TextDisplayName" FontFamily="{DynamicResource HeadingFontFamily}"
           FontWeight="SemiBold" FontSize="{DynamicResource FontSizeLargest}"
           TextWrapping="Wrap" DockPanel.Dock="Left"${extra}
           VerticalAlignment="Center" Foreground="{DynamicResource GlyphBrush}">
    <TextBlock.Effect>
        <DropShadowEffect ShadowDepth="2" BlurRadius="0" Opacity="1" RenderingBias="Performance" />
    </TextBlock.Effect>
</TextBlock>`;

function iconButton(name, col, key, tip, focus = '') {
  const n = name === 'PART_ButtonEditGame' ? `x:Name="${name}"` : `Name="${name}"`;
  return `<Button ${n}${col}
        Width="40" Height="40" Padding="0" Margin="10,0,0,0"${focus}
        Style="{DynamicResource SecondaryButton}"
        ToolTip="{DynamicResource ${tip}}">
    <ContentPresenter Width="20" Height="20"
                      Content="{DynamicResource ${key}}"
                      ContentTemplate="{DynamicResource IconTemplate}" />
</Button>`;
}

// No game selected: an empty item slot holding the quest mark, under a slow gold glow, and Playnite's own line.
// Centred in the visible area. The glow loops only while this shows, on Opacity (a plain property).
const EMPTY = `<Grid x:Name="EmptyState" VerticalAlignment="Top" Height="{Binding ViewportHeight, ElementName=PART_ScrollViewHost}">
    <Grid.Style>
        <Style TargetType="Grid">
            <Setter Property="Visibility" Value="Collapsed" />
            <Style.Triggers>
                <DataTrigger Binding="${NO_GAME}" Value="{x:Null}">
                    <Setter Property="Visibility" Value="Visible" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Grid.Style>
    <StackPanel HorizontalAlignment="Center" VerticalAlignment="Center" Margin="24">
        <Grid Width="72" Height="72" HorizontalAlignment="Center">
            <Rectangle Margin="-44" IsHitTestVisible="False" Fill="{DynamicResource GlyphBrush}">
                <Rectangle.OpacityMask>
                    <ImageBrush ImageSource="{ThemeFile 'Images/fx/glow-spot.png'}" Stretch="Fill" />
                </Rectangle.OpacityMask>
                <Rectangle.Style>
                    <Style TargetType="Rectangle">
                        <Setter Property="Opacity" Value="0.22" />
                        <Style.Triggers>
                            <DataTrigger Binding="${NO_GAME}" Value="{x:Null}">
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
            <Border Background="{DynamicResource GridItemBackgroundBrush}"
                    BorderBrush="{DynamicResource SlotBorderBrush}" BorderThickness="2"
                    CornerRadius="{DynamicResource CornerRadiusLarge}" />
            <Border Margin="3" BorderBrush="{DynamicResource FrameInnerBrush}" BorderThickness="1"
                    CornerRadius="{DynamicResource ControlCornerRadius}" />
            <ContentPresenter Width="40" Height="40" HorizontalAlignment="Center" VerticalAlignment="Center"
                              TextElement.Foreground="{DynamicResource GlyphBrush}"
                              Content="{DynamicResource IconUpdate}"
                              ContentTemplate="{DynamicResource IconTemplate}" />
        </Grid>
        <TextBlock Text="{DynamicResource LOCErrorNoGameSelected}" Margin="0,22,0,0"
                   HorizontalAlignment="Center" TextAlignment="Center" TextWrapping="Wrap"
                   FontSize="{DynamicResource FontSizeLarge}"
                   Style="{DynamicResource BaseTextBlockStyle}"
                   Foreground="{DynamicResource GlyphBrush}" />
    </StackPanel>
</Grid>`;

const CONTENT_STYLE = hideWhenNoGame('Grid');

const HEAD = `<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
                    xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
                    xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
                    xmlns:pbeh="clr-namespace:Playnite.Behaviors;assembly=Playnite"
                    mc:Ignorable="d">`;

const PAGE_NOTES = `      - Title: gold capitals (HeadingFontFamily) with a two pixel shadow. Icon and cover sit in item slots.
      - Actions: Play is the big red panel button (DerivedStyles/PlayButton.xaml); More and Edit are 40x40 charcoal
        plates with gold glyphs (SecondaryButton), each with a tooltip.
      - Left: Steam screenshots and the description in one info panel, the client's tooltip frame (near-black
        backdrop inside a metal line with a black line inside it), gold headings, white text drawn by
        DescriptionView.html. The notes are a letter under it: ink on tiled paper.
      - Right: the details panel, the same frame: gold captions, white values, scores in the item quality colors,
        tags as small black slots. Every metadata field, in the six shared groups, split by space; a group goes away
        with its last visible field.
      - No game selected: an empty slot with the quest mark under a slow gold glow.
    Generated by art/gen-overviews.mjs; change the page there.`;

function detailsView() {
  const header = `<!-- Title, icon, cover and the action buttons -->
<DockPanel Margin="0,24,0,20" MaxWidth="1024" Grid.Row="1" Background="Transparent">
${indent(slot('<Image Name="PART_ImageCover" Height="{Settings GameDetailsCoverHeight}" StretchDirection="Both" Stretch="Uniform" RenderOptions.BitmapScalingMode="Fant" />', ' DockPanel.Dock="Right"').replace('VerticalAlignment="Center"', 'VerticalAlignment="Bottom"'), 4)}
    <StackPanel VerticalAlignment="Bottom" DockPanel.Dock="Left">
        <DockPanel>
${indent(slot('<Image Name="PART_ImageIcon" MaxHeight="48" MaxWidth="48" VerticalAlignment="Center" RenderOptions.BitmapScalingMode="Fant" />', ' DockPanel.Dock="Left" Margin="0,0,12,0"'), 12)}
${indent(title(' Margin="0,0,10,0"'), 12)}
        </DockPanel>
        <StackPanel HorizontalAlignment="Left" VerticalAlignment="Top"
                    Orientation="Horizontal" Margin="0,18,0,0">
            <Grid>
                <Button Name="PART_ButtonPlayAction"
                        Width="150" Height="40" Style="{DynamicResource PlayButton}" />
                <Button Name="PART_ButtonContextAction" Tag="ContextAction" Style="{DynamicResource PlayButton}"
                        Width="150" Height="40" />
                <Control Style="{DynamicResource RunningActionIndicator}" />
            </Grid>
${indent(iconButton('PART_ButtonMoreActions', '', 'IconOptions', 'LOCMoreAction'), 12)}
${indent(iconButton('PART_ButtonEditGame', '', 'IconEdit', 'LOCEditGame', ' Focusable="False"'), 12)}
        </StackPanel>
    </StackPanel>
</DockPanel>`;
  const body = `<DockPanel MaxWidth="1024" Grid.Row="2">
${indent(detailsPanel(false, ' DockPanel.Dock="Right" Margin="20,0,0,20" VerticalAlignment="Top"'), 4)}
${indent(textColumn(' Margin="0,0,0,20"'), 4)}
</DockPanel>`;
  const page = `<Grid x:Name="PageRoot">
${indent(pageRootStyle('ContentBackgroundBrush'), 8)}
    <!-- Visibility is set here on purpose: the inherited DetailsScrollViewer style collapses the host on a null
         DataContext, which would hide the empty state too. -->
    <ScrollViewer HorizontalScrollBarVisibility="Disabled"
                  VerticalScrollBarVisibility="Auto"
                  Style="{DynamicResource DetailsScrollViewer}" Visibility="Visible"
                  d:DesignWidth="1280"
                  d:DesignHeight="1280"
                  d:DataContext="{x:Static DesignMainViewModel.DesignSelectedGameDetailsIntance}"
                  x:Name="PART_ScrollViewHost">
        <Grid>
${indent(EMPTY, 12)}
            <Grid x:Name="GameContent">
${indent(CONTENT_STYLE, 16)}
${indent(HERO, 16)}
                <Grid HorizontalAlignment="Stretch" Margin="20,0,37,0">
                    <Grid.RowDefinitions>
                        <RowDefinition Height="Auto" />
                        <RowDefinition Height="Auto" />
                        <RowDefinition Height="*" />
                    </Grid.RowDefinitions>
${indent(bannerSpacer('x * 100 / 320', 0, 'DetailsBannerSpacer').replace('<Border ', '<Border Grid.Row="0" '), 20)}
${indent(header, 20)}
${indent(body, 20)}
                </Grid>
            </Grid>
        </Grid>
    </ScrollViewer>
</Grid>`;
  return `<!--
    Overlay on Playnite Default/Views/DetailsViewGameOverview.xaml: the game page of the details view.
    Playnite's arrangement is kept (background art as a banner, GameBannerHeight; the cover and title over it; the
    action buttons; text on the left, details on the right); every PART_ name is Playnite's.
${PAGE_NOTES}
-->
${HEAD}
    <Style TargetType="{x:Type DetailsViewGameOverview}">
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="{x:Type DetailsViewGameOverview}">
${indent(page, 20)}
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;
}

function gridView() {
  const header = `<DockPanel Panel.ZIndex="2">
${indent(inlineCloseButton(), 4)}
${indent(slot('<Image Name="PART_ImageIcon" MaxHeight="32" MaxWidth="32" RenderOptions.BitmapScalingMode="Fant" />', ' DockPanel.Dock="Left" Margin="0,0,10,0"'), 4)}
${indent(title(), 4)}
</DockPanel>
<Grid Margin="0,14,0,20" Background="Transparent">
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="*" MaxWidth="150" />
        <ColumnDefinition Width="Auto" />
        <ColumnDefinition Width="Auto" />
    </Grid.ColumnDefinitions>
    <Button Name="PART_ButtonPlayAction" Grid.Column="0"
            Height="40" Style="{DynamicResource PlayButton}" />
    <Button Name="PART_ButtonContextAction" Tag="ContextAction" Style="{DynamicResource PlayButton}"
            Height="40" Grid.Column="0" />
${indent(iconButton('PART_ButtonMoreActions', ' Grid.Column="1"', 'IconOptions', 'LOCMoreAction'), 4)}
${indent(iconButton('PART_ButtonEditGame', ' Grid.Column="2"', 'IconEdit', 'LOCEditGame', ' Focusable="False"'), 4)}
    <Control Grid.Column="0" Style="{DynamicResource RunningActionIndicator}" />
</Grid>`;
  const body = `<Grid VerticalAlignment="Top">
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="*" />
        <ColumnDefinition Width="24" />
        <ColumnDefinition Width="Auto" />
    </Grid.ColumnDefinitions>
${indent(textColumn(' Grid.Column="0" Margin="0,0,0,16"'), 4)}
${indent(detailsPanel(true, ' Grid.Column="2" Margin="0,0,0,16" VerticalAlignment="Top"'), 4)}
</Grid>`;
  const page = `<Grid x:Name="PageRoot"
      d:DataContext="{x:Static DesignMainViewModel.DesignSelectedGameDetailsIntance}">
${indent(pageRootStyle('ContentBackgroundBrush'), 8)}
    <ScrollViewer CanContentScroll="False" HorizontalAlignment="Stretch"
                  HorizontalScrollBarVisibility="Disabled" VerticalScrollBarVisibility="Auto"
                  x:Name="PART_ScrollViewHost">
        <Grid>
${indent(EMPTY, 12)}
            <!-- The header scrolls with the page (not pinned above it). -->
            <Grid x:Name="GameContent">
${indent(CONTENT_STYLE, 16)}
${indent(HERO, 16)}
                <StackPanel Margin="24,0,24,0">
${indent(bannerSpacer('x * 84 / 320', 24, 'GridBannerSpacer'), 20)}
${indent(header, 20)}
${indent(body, 20)}
                </StackPanel>
            </Grid>
        </Grid>
    </ScrollViewer>
${indent(sidePanelCloseButton({ comment: '<!-- Close: a 28x28 plate that reads at rest (the theme\'s red button plate, a rim and a bright glyph) and turns the danger color on hover. -->' }), 4)}
</Grid>`;
  return `<!--
    Overlay on Playnite Default/Views/GridViewGameOverview.xaml: the side panel of the grid view, set like the
    details view (Views/DetailsViewGameOverview.xaml). The close button is the frame's red plate, before the icon below 120px banner height and top left otherwise.
    Every PART_ name is Playnite's.
${PAGE_NOTES}
-->
${HEAD}
    <Style TargetType="{x:Type GridViewGameOverview}">
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="{x:Type GridViewGameOverview}">
${indent(page, 20)}
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;
}

writeOverviews(VIEWS, detailsView(), gridView());
