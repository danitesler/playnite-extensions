// Generates Henchwork's DetailsViewGameOverview.xaml and GridViewGameOverview.xaml from the shared overview helpers.
// Usage: node src/themes/Henchwork/art/gen-overviews.mjs   (then node scripts/game-page-breakpoints.mjs on both files)
import {
  META_GROUPS,
  bannerDarkeningFloor,
  bannerSpacer,
  heroVisibilityStyle,
  hideWhenNoGame,
  indent,
  inlineCloseButton,
  metadataGroup,
  pageRootStyle,
  resolveThemeSrcDir,
  sidePanelCloseButton,
  steamGameScope,
  writeOverviews,
} from '../../../../scripts/overview-generator.mjs';

const out = resolveThemeSrcDir(import.meta.url);

// 28x28 Quit key: slate-hi plate with a slate-line rim on a 2px hard ink offset and a 14px cream close glyph;
// hover fades in the orange Quit tile (DangerBrush, 120ms) and the glyph turns ink.
const closeTemplate = `<ControlTemplate TargetType="{x:Type Button}">
    <Grid Background="Transparent" SnapsToDevicePixels="True">
        <Border Margin="2,2,-2,-2" CornerRadius="{DynamicResource ControlCornerRadius}"
                Background="{DynamicResource LocalInkBrush}" IsHitTestVisible="False" />
        <Border x:Name="Plate" Background="{DynamicResource ButtonBackgroundBrush}"
                BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="1"
                CornerRadius="{DynamicResource ControlCornerRadius}">
            <Grid>
                <Border x:Name="HoverPlate" Margin="-1" CornerRadius="{DynamicResource ControlCornerRadius}"
                        Background="{DynamicResource DangerBrush}" Opacity="0" IsHitTestVisible="False" />
                <ContentControl x:Name="Glyph" Width="14" Height="14"
                                HorizontalAlignment="Center" VerticalAlignment="Center"
                                IsHitTestVisible="False" Content="{DynamicResource IconWindowClose}"
                                ContentTemplate="{DynamicResource IconTemplate}" Foreground="{DynamicResource TextBrush}" />
            </Grid>
        </Border>
    </Grid>
    <ControlTemplate.Triggers>
        <Trigger Property="IsMouseOver" Value="True">
            <Setter TargetName="Plate" Property="BorderBrush" Value="{DynamicResource DangerBrush}" />
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
            <Setter TargetName="HoverPlate" Property="Background" Value="{DynamicResource LocalOrangeDeepBrush}" />
        </Trigger>
    </ControlTemplate.Triggers>
</ControlTemplate>`;

// Odometer score: a dim "000" counter with the lit score laid over its right-hand slots (Consolas keeps the
// slots aligned; the score's own HUD background covers the zeros it replaces).
const scoreRenderer = (part, layout) => `<Grid${layout === 'stack' ? ' Grid.Column="2"' : ''} HorizontalAlignment="Left" VerticalAlignment="Center">
    <TextBlock Text="000" Style="{DynamicResource TextBlockGameScore}" Padding="7,2,7,2"
               Foreground="{DynamicResource LocalSlateLineBrush}" IsHitTestVisible="False" />
    <TextBlock x:Name="${part}" HorizontalAlignment="Right" Style="{DynamicResource TextBlockGameScore}" />
</Grid>`;

const fieldOptions = {
  margin: '0,4',
  captionFontWeight: 'SemiBold',
  captionFontSize: 'FontSizeSmall',
  captionForeground: 'LocalPurpleBrush',
  captionVerticalAlignment: 'Top',
  captionStackMargin: '0,2,0,0',
  valueOptions: { chipsMargin: '0,0,0,-4', itemsWrapPanel: true, textForeground: 'LocalInkTextBrush' },
  scoreRenderer,
};

// Dossier group break: a 5px purple header strip led by an orange diamond bullet (Height 5 + Margin bottom 8 = 13;
// group top 10 => the clipped stack starts at -23 so the first group draws no strip).
const groupBreak = `<Grid Height="5" Margin="0,0,-14,8" IsHitTestVisible="False">
    <Rectangle Fill="{DynamicResource LocalPurpleBrush}" />
    <Rectangle Width="8" Height="8" Margin="-12,0,0,0" HorizontalAlignment="Left" VerticalAlignment="Center"
               Fill="{DynamicResource LocalOrangeBrush}" RenderTransformOrigin="0.5,0.5">
        <Rectangle.RenderTransform>
            <RotateTransform Angle="45" />
        </Rectangle.RenderTransform>
    </Rectangle>
</Grid>`;

// Ring-bound dossier: cream paper on a 4px hard ink offset, faint paper fibre, punch holes and steel spiral rings
// tiled down the left edge (DrawingBrush, so it follows any height), purple strips between groups.
function renderMetadataPane(widthKey) {
  const blocks = META_GROUPS.map(g => metadataGroup(g, 'stack', {
    margin: '0,10,0,0',
    padding: '0',
    borderThickness: '',
    borderBrush: '',
    beforeFields: groupBreak,
    fieldOptions,
  })).join('\n');

  return `<Grid VerticalAlignment="Top" Margin="8,0,10,10" SnapsToDevicePixels="True">
    <Control Margin="0,0,-10,-10" Template="{DynamicResource LocalHatchShadowTemplate}" Foreground="{DynamicResource LocalInkBrush}"
             Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
    <Border CornerRadius="{DynamicResource ControlCornerRadius}" Background="{DynamicResource LocalPaperBrush}"
            TextElement.Foreground="{DynamicResource LocalInkTextBrush}">
        <Grid>
            <Rectangle Fill="{DynamicResource LocalPaperShadeBrush}" Opacity="0.7" IsHitTestVisible="False"
                       OpacityMask="{DynamicResource LocalPaperFibreMaskBrush}" />
            <Rectangle Fill="{DynamicResource LocalPaperShadeBrush}" Opacity="0.6" IsHitTestVisible="False"
                       OpacityMask="{DynamicResource LocalGrungeMaskBrush}" />
            <!-- Faded rubber stamp in the top-right corner -->
            <Rectangle Width="96" Height="96" Margin="0,-10,-8,0" HorizontalAlignment="Right" VerticalAlignment="Top"
                       Fill="{DynamicResource LocalPurpleBrush}" Opacity="0.2" IsHitTestVisible="False"
                       OpacityMask="{DynamicResource LocalStampMaskBrush}" RenderTransformOrigin="0.5,0.5">
                <Rectangle.RenderTransform>
                    <RotateTransform Angle="-14" />
                </Rectangle.RenderTransform>
            </Rectangle>
            <Border Padding="30,12,14,12">
                <StackPanel Width="{DynamicResource ${widthKey}}">
                    <Grid ClipToBounds="True">
                        <StackPanel Margin="0,-23,0,-4">
${indent(blocks, 28)}
                        </StackPanel>
                    </Grid>
                </StackPanel>
            </Border>
        </Grid>
    </Border>
    <Control Template="{DynamicResource LocalSketchFrameTemplate}" Foreground="{DynamicResource LocalInkBrush}"
             Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
    <!-- Spiral binding: punch hole + steel ring, tiled every 34px down the left edge -->
    <Rectangle Width="22" HorizontalAlignment="Left" Margin="-8,12,0,12" IsHitTestVisible="False">
        <Rectangle.Fill>
            <DrawingBrush TileMode="Tile" Viewport="0,0,22,34" ViewportUnits="Absolute" Viewbox="0,0,22,34" ViewboxUnits="Absolute" Stretch="None">
                <DrawingBrush.Drawing>
                    <DrawingGroup>
                        <GeometryDrawing Brush="Transparent">
                            <GeometryDrawing.Geometry><RectangleGeometry Rect="0,0,22,34" /></GeometryDrawing.Geometry>
                        </GeometryDrawing>
                        <GeometryDrawing Brush="{DynamicResource LocalBlueprintBrush}">
                            <GeometryDrawing.Geometry><EllipseGeometry Center="17,17" RadiusX="3" RadiusY="3" /></GeometryDrawing.Geometry>
                        </GeometryDrawing>
                        <GeometryDrawing>
                            <GeometryDrawing.Pen><Pen Brush="{DynamicResource LocalSteelBrush}" Thickness="3" /></GeometryDrawing.Pen>
                            <GeometryDrawing.Geometry><EllipseGeometry Center="11,17" RadiusX="8.5" RadiusY="4.5" /></GeometryDrawing.Geometry>
                        </GeometryDrawing>
                    </DrawingGroup>
                </DrawingBrush.Drawing>
            </DrawingBrush>
        </Rectangle.Fill>
    </Rectangle>
</Grid>`;
}

const sectionHeading = loc => `<Control Template="{DynamicResource TapeLabelTemplate}" Tag="{DynamicResource ${loc}}"
         Margin="0,0,0,12" HorizontalAlignment="Left" Focusable="False" IsTabStop="False" />`;

const steamSection = steamGameScope(`    <ContentControl x:Name="SteamScreenshots_SteamScreenshotsViewControl" Margin="0,0,0,18">
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
                    <MultiDataTrigger>
                        <MultiDataTrigger.Conditions>
                            <Condition Binding="{Binding Game.Source.Name}" Value="Steam" />
                            <Condition Binding="{PluginSettings Plugin=SteamScreenshots, Path=IsControlVisible, FallbackValue=PluginUnavailable}" Value="False" />
                        </MultiDataTrigger.Conditions>
                        <Setter Property="Visibility" Value="Visible" />
                    </MultiDataTrigger>
                </Style.Triggers>
            </Style>
        </Grid.Style>
        <Control x:Name="SteamScreenshotsSkeleton" Tag="{Binding Game.Id, NotifyOnTargetUpdated=True}" Visibility="Collapsed"
                 Margin="0,0,0,18" Template="{DynamicResource SteamScreenshotsSkeletonTemplate}"
                 Focusable="False" IsTabStop="False">
            <Control.Triggers>
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
            </Control.Triggers>
        </Control>
    </Grid>`, { comment: false });

const mainContent = `<StackPanel VerticalAlignment="Top">
${indent(steamSection, 4)}
    <StackPanel x:Name="PART_ElemDescription">
${indent(sectionHeading('LOCGameDescriptionTitle'), 8)}
        <HtmlTextView x:Name="PART_HtmlDescription" HtmlFontFamily="{DynamicResource FontFamily}" HtmlFontSize="{DynamicResource FontSize}"
                      TextElement.Foreground="{DynamicResource TextBrush}"
                      Tag="{DynamicResource LinkBrush}"
                      HtmlForeground="{Binding Path=(TextElement.Foreground).Color, RelativeSource={RelativeSource Self}}"
                      LinkForeground="{Binding Tag.Color, RelativeSource={RelativeSource Self}}" />
    </StackPanel>
    <StackPanel x:Name="PART_ElemNotes" Margin="0,22,0,0">
${indent(sectionHeading('LOCNotesLabel'), 8)}
        <TextBox x:Name="PART_TextNotes" IsReadOnly="True" TextWrapping="Wrap" Style="{DynamicResource LocalNotesTextBox}" />
    </StackPanel>
</StackPanel>`;

// Banner: art darkened toward the bottom, closed by a hard 4px ink rule with a mustard tape pinned across it
// (the vault-eye printed on the tape). No soft fade into the page.
const heroBanner = `<Grid x:Name="HeroArt" VerticalAlignment="Top" IsHitTestVisible="False">
${indent(heroVisibilityStyle(), 4)}
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill" />
${indent(bannerDarkeningFloor(), 4)}
    <Rectangle>
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                <GradientStop Color="#00070B10" Offset="0.25" />
                <GradientStop Color="#C8070B10" Offset="0.86" />
                <GradientStop Color="#E6070B10" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
    <Rectangle>
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0" EndPoint="1,0">
                <GradientStop Color="#99070B10" Offset="0" />
                <GradientStop Color="#00070B10" Offset="0.55" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
    <!-- Pencil-hatched shading across the lower banner -->
    <Grid>
        <Grid.RowDefinitions>
            <RowDefinition Height="3*" />
            <RowDefinition Height="2*" />
        </Grid.RowDefinitions>
        <Rectangle Grid.Row="1" Fill="{DynamicResource LocalInkBrush}" Opacity="0.45"
                   OpacityMask="{DynamicResource LocalPencilHatchMaskBrush}" />
    </Grid>
    <Rectangle Height="4" VerticalAlignment="Bottom" Fill="{DynamicResource LocalInkBrush}" />
    <Rectangle Height="6" VerticalAlignment="Bottom" Margin="0,0,0,-3" Fill="{DynamicResource LocalInkBrush}"
               OpacityMask="{DynamicResource LocalSketchHMaskBrush}" />
    <Grid Width="64" Height="24" Margin="0,0,26,-8" HorizontalAlignment="Right" VerticalAlignment="Bottom" RenderTransformOrigin="0.5,0.5">
        <Grid.RenderTransform>
            <RotateTransform Angle="-3" />
        </Grid.RenderTransform>
        <Border Margin="0,3,0,-3" Background="{DynamicResource LocalMustardDeepBrush}" OpacityMask="{DynamicResource LocalTapeTornMaskBrush}" />
        <Border Background="{DynamicResource LocalMustardTapeBrush}" OpacityMask="{DynamicResource LocalTapeTornMaskBrush}" />
        <Border Background="{DynamicResource LocalMustardDeepBrush}" Opacity="0.35" OpacityMask="{DynamicResource LocalGrungeSmallMaskBrush}" />
        <Border>
            <Control Width="16" Height="16" Template="{DynamicResource BrandMarkTemplate}" Foreground="{DynamicResource LocalInkTextBrush}" />
        </Border>
    </Grid>
</Grid>`;

const actionsRow = `<Grid MinWidth="170" Height="40">
    <Button x:Name="PART_ButtonPlayAction" Style="{DynamicResource PlayButton}" />
    <Button x:Name="PART_ButtonContextAction" Tag="ContextAction" Style="{DynamicResource PlayButton}" />
    <Control Style="{DynamicResource RunningActionIndicator}" />
</Grid>
<Button x:Name="PART_ButtonMoreActions" Width="40" Height="40" Padding="0" Style="{DynamicResource SecondaryButton}" Margin="12,0,0,0" ToolTip="{DynamicResource LOCMoreAction}">
    <ContentControl Content="{DynamicResource IconOptions}" ContentTemplate="{DynamicResource IconTemplate}" Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
</Button>
<Button x:Name="PART_ButtonEditGame" Width="40" Height="40" Padding="0" Style="{DynamicResource SecondaryButton}" Margin="8,0,0,0" ToolTip="{DynamicResource LOCEditGame}">
    <ContentControl Content="{DynamicResource IconEdit}" ContentTemplate="{DynamicResource IconTemplate}" Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
</Button>`;

// Title with a mustard felt-marker swipe under its baseline.
const titleStack = `<Grid HorizontalAlignment="Left" VerticalAlignment="Center">
    <Rectangle Height="13" VerticalAlignment="Bottom" Margin="-4,0,-12,-9" Fill="{DynamicResource LocalMustardBrush}" Opacity="0.85"
               OpacityMask="{DynamicResource LocalMarkerMaskBrush}" IsHitTestVisible="False" />
    <TextBlock x:Name="PART_TextDisplayName" VerticalAlignment="Center"
               FontFamily="{DynamicResource HeadingFontFamily}" FontWeight="Bold" FontSize="40"
               Foreground="{DynamicResource TextBrush}" TextWrapping="Wrap">
<TextBlock.Effect><DropShadowEffect Color="#F3F0DC" ShadowDepth="1.2" Direction="0" BlurRadius="0" Opacity="1" /></TextBlock.Effect></TextBlock>
</Grid>`;

const iconPlate = maxSize => `<Grid DockPanel.Dock="Left" VerticalAlignment="Center" Margin="0,0,14,0"
      Visibility="{Binding Visibility, ElementName=PART_ImageIcon}">
    <Control Margin="0,0,-8,-8" Template="{DynamicResource LocalHatchShadowTemplate}" Foreground="{DynamicResource LocalInkBrush}"
             Focusable="False" IsTabStop="False" />
    <Border CornerRadius="{DynamicResource ControlCornerRadius}" Padding="2"
            Background="{DynamicResource LocalHudBrush}" BorderBrush="{DynamicResource LocalInkBrush}" BorderThickness="2">
        <Image x:Name="PART_ImageIcon" MaxWidth="${maxSize}" MaxHeight="${maxSize}" />
    </Border>
</Grid>`;

// Faint war-map contours and worn paint on the game page (hidden while window art shows through).
const pageTexture = `<Grid IsHitTestVisible="False" ClipToBounds="True">
    <Grid.Style>
        <Style TargetType="Grid">
            <Style.Triggers>
                <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                    <Setter Property="Visibility" Value="Collapsed" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Grid.Style>
    <Rectangle Fill="{DynamicResource LocalGridLineBrush}" Opacity="0.4" OpacityMask="{DynamicResource LocalBlueprintGridMaskBrush}" />
    <Rectangle Fill="{DynamicResource LocalBlueprintBrush}" Opacity="0.5" OpacityMask="{DynamicResource LocalGrungeMaskBrush}" />
</Grid>`;

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
    <Rectangle Fill="{DynamicResource LocalGridLineBrush}" Opacity="0.4" OpacityMask="{DynamicResource LocalBlueprintGridMaskBrush}" IsHitTestVisible="False" />
    <Control Template="{DynamicResource EmptyGameTemplate}" Focusable="False" IsTabStop="False" />
</Grid>`;

function renderTwoColumnBody(widthKey) {
  return `<Grid Margin="0,14,0,0">
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="*" />
        <ColumnDefinition Width="Auto" />
    </Grid.ColumnDefinitions>
${indent(mainContent, 4)}
    <Grid Grid.Column="1" Margin="18,0,0,0" VerticalAlignment="Top">
${indent(renderMetadataPane(widthKey), 8)}
    </Grid>
</Grid>`;
}

const detailsXaml = `<!--
    Henchwork: Views/DetailsViewGameOverview.xaml (generated by art/gen-overviews.mjs).
    - Hero banner (GameBannerHeight=300, spacer x * 224 / 300 floor 18) with GameBannerDarken + 50% floor, darkened
      toward a hard 4px ink rule with a mustard tape (vault-eye) pinned across it.
    - Header: game icon on an ink-offset HUD plate, bold condensed title, green go-slab PlayButton +
      RunningActionIndicator, equal 40x40 icon-only SecondaryButton More and Edit.
    - Body: SteamScreenshotsGameScope + tape-labelled Description / Notes beside the ring-bound dossier
      (GameDetailsPaneWidth=300 usable width, GameDetailsPanePosition Left / Center / Stretch / Right via
      scripts/game-page-breakpoints.mjs). Scores are odometers with dim zeros.
    - Empty state: tilted loading poster (EmptyGameTemplate) over a blueprint grid, centred in ViewportHeight
      (PART_ScrollViewHost Visible).
-->
<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">
    <Style TargetType="DetailsViewGameOverview">
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="DetailsViewGameOverview">
                    <ScrollViewer x:Name="PART_ScrollViewHost" Visibility="Visible" HorizontalScrollBarVisibility="Disabled" VerticalScrollBarVisibility="Visible">
                        <Grid x:Name="PageRoot" UseLayoutRounding="True">
${indent(pageRootStyle(), 28)}
${indent(pageTexture, 28)}
${indent(heroBanner, 28)}
                            <StackPanel Margin="26,0,26,28">
${indent(hideWhenNoGame('StackPanel'), 32)}
${indent(bannerSpacer('x * 224 / 300', 18, 'DetailsBannerSpacer'), 32)}
                                <DockPanel Margin="0,8,0,14">
                                    <StackPanel Orientation="Horizontal" DockPanel.Dock="Right" VerticalAlignment="Center" Margin="18,0,4,0">
${indent(actionsRow, 40)}
                                    </StackPanel>
                                    <DockPanel>
${indent(iconPlate(44), 40)}
${indent(titleStack, 40)}
                                    </DockPanel>
                                </DockPanel>
${indent(renderTwoColumnBody('GameDetailsPaneWidth'), 32)}
                            </StackPanel>
${indent(emptyState, 28)}
                        </Grid>
                    </ScrollViewer>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;

const gridXaml = `<!--
    Henchwork: Views/GridViewGameOverview.xaml (generated by art/gen-overviews.mjs).
    - Hero banner (GameBannerHeight=300, spacer x * 214 / 300 floor 14) with GameBannerDarken + 50% floor, closed by
      the ink rule and mustard tape.
    - CloseGameSideBarCommand: custom 28x28 Quit key (slate-hi plate on an ink offset, hover fades in the orange Quit
      tile); inline left of the icon when GameBannerHeight < 120 or ShowBackgroundImageOnWindow=True, corner 12,12 otherwise.
    - Actions under the title: green go-slab PlayButton + RunningActionIndicator + equal 40x40 SecondaryButton More and Edit.
    - Ring-bound dossier (GridDetailsPaneWidth=300 usable width, 2*:3* columns, GameDetailsPanePosition).
    - Empty state: tilted loading poster over a blueprint grid, centred in ViewportHeight when Game is null.
-->
<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">
    <Style TargetType="GridViewGameOverview">
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="GridViewGameOverview">
                    <Border BorderBrush="{DynamicResource LocalInkBrush}">
                        <Border.Style>
                            <Style TargetType="Border">
                                <Setter Property="BorderThickness" Value="2,0,0,0" />
                                <Style.Triggers>
                                    <DataTrigger Binding="{Settings GridViewDetailsPosition}" Value="Left"><Setter Property="BorderThickness" Value="0,0,2,0" /></DataTrigger>
                                    <DataTrigger Binding="{Settings ShowPanelSeparators}" Value="False"><Setter Property="BorderThickness" Value="0" /></DataTrigger>
                                </Style.Triggers>
                            </Style>
                        </Border.Style>
                        <Grid>
                            <ScrollViewer CanContentScroll="False" x:Name="PART_ScrollViewHost" Visibility="Visible" HorizontalScrollBarVisibility="Disabled" VerticalScrollBarVisibility="Visible">
                                <Grid x:Name="PageRoot" UseLayoutRounding="True">
${indent(pageRootStyle(), 36)}
${indent(pageTexture, 36)}
${indent(heroBanner, 36)}
                                    <StackPanel Panel.ZIndex="2" Margin="22,0,22,26">
${indent(hideWhenNoGame('StackPanel'), 40)}
${indent(bannerSpacer('x * 214 / 300', 14, 'GridBannerSpacer'), 40)}
                                        <StackPanel Panel.ZIndex="2" Margin="0,8,0,14">
                                            <DockPanel Panel.ZIndex="2">
${indent(inlineCloseButton(), 48)}
${indent(iconPlate(42), 48)}
${indent(titleStack, 48)}
                                            </DockPanel>
                                            <StackPanel Orientation="Horizontal" Margin="0,14,0,0">
${indent(actionsRow, 48)}
                                            </StackPanel>
                                        </StackPanel>
${indent(renderTwoColumnBody('GridDetailsPaneWidth'), 40)}
                                    </StackPanel>
${indent(emptyState, 36)}
                                </Grid>
                            </ScrollViewer>
${indent(sidePanelCloseButton({ template: closeTemplate, comment: '' }), 28)}
                        </Grid>
                    </Border>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;

writeOverviews(out, detailsXaml, gridXaml);
