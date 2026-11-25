// Generates Canister Views/DetailsViewGameOverview.xaml & Views/GridViewGameOverview.xaml
// using shared overview helpers and runs scripts/game-page-breakpoints.mjs automatically
// for Left / Center / Stretch / Right metadata positioning.
// Usage: node src/themes/Canister/art/gen-overviews.mjs
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

// Custom 28x28 Hand-Inked Comic Sticker Square side-panel close button:
// dark comic ink plate (#191D22) with 1.5px sketchy white rim & 2px Acid Mutagen offset tab;
// hover snaps cleanly to Tag Crimson (#EE2836) with white glyph and Golden Marker offset tab.
const canisterCloseTemplate = `<ControlTemplate TargetType="{x:Type Button}">
    <Grid Background="Transparent" SnapsToDevicePixels="True">
        <Border x:Name="OffsetTab" Background="{DynamicResource GlyphBrush}"
                CornerRadius="{DynamicResource ControlCornerRadius}" IsHitTestVisible="False">
            <Border.RenderTransform><TranslateTransform X="2" Y="2" /></Border.RenderTransform>
        </Border>
        <Border x:Name="Plate" Background="{DynamicResource PopupBackgroundBrush}"
                BorderBrush="{DynamicResource FrameBrush}" BorderThickness="1.5"
                CornerRadius="{DynamicResource ControlCornerRadius}" IsHitTestVisible="False" />
        <Border x:Name="HoverPlate" Background="{DynamicResource DangerBrush}"
                BorderBrush="{DynamicResource FrameBrush}" BorderThickness="1.5"
                CornerRadius="{DynamicResource ControlCornerRadius}" Opacity="0" IsHitTestVisible="False" />
        <ContentControl x:Name="Glyph" Width="13" Height="13"
                        HorizontalAlignment="Center" VerticalAlignment="Center"
                        IsHitTestVisible="False" Content="{DynamicResource IconWindowClose}"
                        ContentTemplate="{DynamicResource IconTemplate}" Foreground="{DynamicResource TextBrush}" />
    </Grid>
    <ControlTemplate.Triggers>
        <Trigger Property="IsMouseOver" Value="True">
            <Setter TargetName="Glyph" Property="Foreground" Value="{DynamicResource DangerForegroundBrush}" />
            <Setter TargetName="OffsetTab" Property="Background" Value="{DynamicResource GiltBrush}" />
            <Trigger.EnterActions>
                <BeginStoryboard><Storyboard>
                    <DoubleAnimation Storyboard.TargetName="HoverPlate" Storyboard.TargetProperty="Opacity" To="1" Duration="0:0:0.12" />
                </Storyboard></BeginStoryboard>
            </Trigger.EnterActions>
            <Trigger.ExitActions>
                <BeginStoryboard><Storyboard>
                    <DoubleAnimation FillBehavior="Stop" Storyboard.TargetName="HoverPlate" Storyboard.TargetProperty="Opacity" To="0" Duration="0:0:0.16" />
                </Storyboard></BeginStoryboard>
            </Trigger.ExitActions>
        </Trigger>
        <Trigger Property="IsPressed" Value="True">
            <Setter TargetName="HoverPlate" Property="Opacity" Value="0.78" />
        </Trigger>
    </ControlTemplate.Triggers>
</ControlTemplate>`;

const fieldOptions = {
  margin: '0,4',
  captionFontFamily: 'NoteFontFamily',
  captionFontSize: '13.5',
  captionForeground: 'ParchmentLabelBrush',
  captionVerticalAlignment: 'Top',
  captionStackMargin: '0,1,0,0',
  valueOptions: { textForeground: 'ParchmentTextBrush', chipsMargin: '0,0,0,-4', itemsWrapPanel: true },
};

// Dashed crimson conspiracy-string divider centered on a 4-point star (Height=10 + Margin bottom 6 = 16; group top 8 = 24)
const groupBreak = `<Control Template="{DynamicResource DividerTemplate}" Focusable="False" IsTabStop="False" IsHitTestVisible="False"
         Margin="0,0,0,6" />`;

// Pinned Torn Spiral-Notebook Flyer Metadata Dossier (300px usable content width inside paper frame)
function renderMetadataPane(widthKey) {
  const blocks = META_GROUPS.map(g => metadataGroup(g, 'stack', {
    margin: '0,8,0,0',
    padding: '0',
    borderThickness: '',
    borderBrush: '',
    beforeFields: groupBreak,
    fieldOptions,
  })).join('\n');

  return `<Grid VerticalAlignment="Top" SnapsToDevicePixels="True" Margin="3,0,3,6">
    <Grid.RowDefinitions>
        <RowDefinition Height="14" />
        <RowDefinition Height="*" />
        <RowDefinition Height="18" />
    </Grid.RowDefinitions>

    <!-- Dual Tag Crimson & Acid Mutagen chromatic offset backplates behind flyer body -->
    <Border Grid.Row="1" Background="{DynamicResource DangerBrush}" CornerRadius="2" IsHitTestVisible="False">
        <Border.RenderTransform><TranslateTransform X="-3" Y="-2" /></Border.RenderTransform>
    </Border>
    <Border Grid.Row="1" Background="{DynamicResource GlyphBrush}" CornerRadius="2" IsHitTestVisible="False">
        <Border.RenderTransform><TranslateTransform X="3" Y="2" /></Border.RenderTransform>
    </Border>

    <!-- Unlabelled Golden Marker masking-tape strip pinning top of flyer to wall -->
    <Rectangle Grid.Row="0" Grid.RowSpan="2" VerticalAlignment="Top" Height="22" Margin="34,0,26,0"
               Panel.ZIndex="4" Fill="{DynamicResource PrimaryButtonBackgroundBrush}"
               OpacityMask="{DynamicResource LocalTapeStripMask}" IsHitTestVisible="False" />

    <!-- Cobalt Pushpin + Red Conspiracy String top-left ornament -->
    <Canvas Grid.Row="0" Grid.RowSpan="2" Width="36" Height="36" HorizontalAlignment="Left" VerticalAlignment="Top"
            Margin="14,-2,0,0" Panel.ZIndex="6" IsHitTestVisible="False">
        <Path Data="M15,15 C24,22 30,20 35,16" Stroke="{DynamicResource DangerBrush}" StrokeThickness="2" />
        <Path Data="M15,15 C10,24 8,30 6,35" Stroke="{DynamicResource DangerBrush}" StrokeThickness="1.8" />
        <Ellipse Canvas.Left="8.5" Canvas.Top="7.5" Width="13" Height="13"
                 Fill="{DynamicResource RunningIndicatorBrush}" Stroke="{DynamicResource ParchmentTextBrush}" StrokeThickness="1.5" />
        <Ellipse Canvas.Left="11" Canvas.Top="10" Width="4" Height="4" Fill="{DynamicResource LaunchingIndicatorBrush}" />
    </Canvas>

    <!-- Torn spiral-notebook flyer sheet framing 300px usable dark-ink metadata content -->
    <Border Grid.Row="1" Background="{DynamicResource ParchmentBrush}"
            BorderBrush="{DynamicResource ParchmentTextBrush}" BorderThickness="1.5,1.5,1.5,0"
            TextElement.Foreground="{DynamicResource ParchmentTextBrush}">
        <Grid>
            <!-- Faint pale-blue horizontal notebook rules -->
            <Rectangle Fill="{DynamicResource ParchmentEdgeBrush}" Opacity="0.55"
                       OpacityMask="{DynamicResource LocalNotebookLinesMask}" IsHitTestVisible="False" />
            <!-- Left-edge punched spiral notebook binding holes -->
            <Rectangle Width="18" HorizontalAlignment="Left" Margin="-1,10,0,4"
                       Fill="{DynamicResource GameOverviewBackgroundBrush}" Opacity="0.88"
                       OpacityMask="{DynamicResource LocalSpiralHolesMask}" IsHitTestVisible="False" />

            <Border Padding="26,18,16,12">
                <StackPanel Width="{DynamicResource ${widthKey}}">
                    <Grid ClipToBounds="True">
                        <StackPanel Margin="0,-24,0,-4">
${indent(blocks, 28)}
                        </StackPanel>
                    </Grid>
                </StackPanel>
            </Border>
        </Grid>
    </Border>

    <!-- Jagged ripped paper bottom edge -->
    <Rectangle Grid.Row="2" Margin="0,-1,0,0" Fill="{DynamicResource ParchmentBrush}"
               OpacityMask="{DynamicResource LocalTornBottomMask}" IsHitTestVisible="False" />
</Grid>`;
}

const sectionHeading = (loc, brush = 'PrimaryButtonBackgroundBrush') => `<Grid HorizontalAlignment="Left" Margin="0,0,0,10">
    <Rectangle Fill="{DynamicResource ${brush}}" OpacityMask="{DynamicResource LocalTapeStripMask}" IsHitTestVisible="False" />
    <TextBlock Text="{DynamicResource ${loc}}" Margin="14,3,16,3"
               FontFamily="{DynamicResource HeadingFontFamily}" FontSize="14"
               Foreground="{DynamicResource PrimaryButtonForegroundBrush}" />
</Grid>`;

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
${indent(sectionHeading('LOCGameDescriptionTitle', 'PrimaryButtonBackgroundBrush'), 8)}
        <HtmlTextView x:Name="PART_HtmlDescription" HtmlFontFamily="{DynamicResource FontFamily}" HtmlFontSize="{DynamicResource FontSize}"
                      TextElement.Foreground="{DynamicResource TextBrush}"
                      Tag="{DynamicResource LinkBrush}"
                      HtmlForeground="{Binding Path=(TextElement.Foreground).Color, RelativeSource={RelativeSource Self}}"
                      LinkForeground="{Binding Tag.Color, RelativeSource={RelativeSource Self}}" />
    </StackPanel>
    <StackPanel x:Name="PART_ElemNotes" Margin="0,20,0,0">
${indent(sectionHeading('LOCNotesLabel', 'HeaderBandBrush'), 8)}
        <TextBox x:Name="PART_TextNotes" IsReadOnly="True" TextWrapping="Wrap" Style="{DynamicResource LocalNotesTextBox}" />
    </StackPanel>
</StackPanel>`;

// Hero Banner: full-bleed PART_ImageBackground + GameBannerTintBrush darkening + 50% floor + subtle aerosol mist
// + smooth fade into PageRoot.Background.Color + dual Crimson/Mutagen chromatic hairline along the bottom edge.
const heroBanner = `<Grid x:Name="HeroArt" VerticalAlignment="Top" IsHitTestVisible="False">
${indent(heroVisibilityStyle(), 4)}
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill" />
${indent(bannerDarkeningFloor(), 4)}
    <!-- Subtle upper-right aerosol mutagen mist -->
    <Rectangle Width="300" Height="190" HorizontalAlignment="Right" VerticalAlignment="Top" Margin="0,-16,-16,0"
               Fill="{DynamicResource GlyphBrush}" Opacity="0.14"
               OpacityMask="{DynamicResource LocalSplatterCloudMask}" />
    <!-- Smooth vertical fade into comic ink page -->
    <Rectangle>
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                <GradientStop Color="#1A112316" Offset="0" />
                <GradientStop Color="#7A191D22" Offset="0.58" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
    <!-- Dual Crimson + Acid Mutagen chromatic transition hairlines (brushes + OpacityMask) -->
    <Rectangle Height="2" VerticalAlignment="Bottom" Margin="24,0,280,4" Opacity="0.75"
               Fill="{DynamicResource DangerBrush}">
        <Rectangle.OpacityMask>
            <LinearGradientBrush StartPoint="0,0.5" EndPoint="1,0.5">
                <GradientStop Color="#FF000000" Offset="0" />
                <GradientStop Color="#00000000" Offset="0.82" />
            </LinearGradientBrush>
        </Rectangle.OpacityMask>
    </Rectangle>
    <Rectangle Height="2" VerticalAlignment="Bottom" Margin="28,0,276,2" Opacity="0.85"
               Fill="{DynamicResource GlyphBrush}">
        <Rectangle.OpacityMask>
            <LinearGradientBrush StartPoint="0,0.5" EndPoint="1,0.5">
                <GradientStop Color="#FF000000" Offset="0" />
                <GradientStop Color="#00000000" Offset="0.85" />
            </LinearGradientBrush>
        </Rectangle.OpacityMask>
    </Rectangle>
</Grid>`;

const actionsRow = `<Grid MinWidth="172" Height="40">
    <Button x:Name="PART_ButtonPlayAction" Style="{DynamicResource PlayButton}" />
    <Button x:Name="PART_ButtonContextAction" Tag="ContextAction" Style="{DynamicResource PlayButton}" />
    <Control Style="{DynamicResource RunningActionIndicator}" />
</Grid>
<Button x:Name="PART_ButtonMoreActions" Width="40" Height="40" Padding="0" Style="{DynamicResource SecondaryButton}" Margin="10,0,0,0" ToolTip="{DynamicResource LOCMoreAction}">
    <ContentControl Content="{DynamicResource IconOptions}" ContentTemplate="{DynamicResource IconTemplate}" Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
</Button>
<Button x:Name="PART_ButtonEditGame" Width="40" Height="40" Padding="0" Style="{DynamicResource SecondaryButton}" Margin="8,0,0,0" ToolTip="{DynamicResource LOCEditGame}">
    <ContentControl Content="{DynamicResource IconEdit}" ContentTemplate="{DynamicResource IconTemplate}" Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
</Button>`;

// Chromatic-offset Anton comic game title (pure XAML offset TextBlocks behind PART_TextDisplayName, no DropShadowEffect)
const titleStack = `<Grid VerticalAlignment="Center">
    <TextBlock Text="{Binding Text, ElementName=PART_TextDisplayName}" VerticalAlignment="Center"
               FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLargest}"
               Foreground="{DynamicResource DangerBrush}" Opacity="0.85" TextWrapping="Wrap" IsHitTestVisible="False">
        <TextBlock.RenderTransform><TranslateTransform X="-2" Y="0" /></TextBlock.RenderTransform>
    </TextBlock>
    <TextBlock Text="{Binding Text, ElementName=PART_TextDisplayName}" VerticalAlignment="Center"
               FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLargest}"
               Foreground="{DynamicResource LocalOozeDeepBrush}" Opacity="0.85" TextWrapping="Wrap" IsHitTestVisible="False">
        <TextBlock.RenderTransform><TranslateTransform X="2" Y="1" /></TextBlock.RenderTransform>
    </TextBlock>
    <TextBlock x:Name="PART_TextDisplayName" VerticalAlignment="Center"
               FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLargest}"
               Foreground="{DynamicResource TextBrush}" TextWrapping="Wrap" />
</Grid>`;

const iconPlate = (size) => `<Grid DockPanel.Dock="Left" VerticalAlignment="Center" Margin="0,0,14,0"
      Visibility="{Binding Visibility, ElementName=PART_ImageIcon}">
    <Border Background="{DynamicResource DangerBrush}" CornerRadius="{DynamicResource ControlCornerRadius}" IsHitTestVisible="False">
        <Border.RenderTransform><TranslateTransform X="-2" Y="-2" /></Border.RenderTransform>
    </Border>
    <Border Background="{DynamicResource GlyphBrush}" CornerRadius="{DynamicResource ControlCornerRadius}" IsHitTestVisible="False">
        <Border.RenderTransform><TranslateTransform X="2" Y="2" /></Border.RenderTransform>
    </Border>
    <Border CornerRadius="{DynamicResource ControlCornerRadius}" Padding="3"
            Background="{DynamicResource InputBackgroundBrush}"
            BorderBrush="{DynamicResource FrameBrush}" BorderThickness="1.5">
        <Image x:Name="PART_ImageIcon" MaxWidth="${size}" MaxHeight="${size}" />
    </Border>
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
    <Control Template="{DynamicResource EmptyGameTemplate}" Focusable="False" IsTabStop="False" />
</Grid>`;

function renderTwoColumnBody(widthKey) {
  return `<Grid Margin="0,12,0,0">
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="*" />
        <ColumnDefinition Width="Auto" />
    </Grid.ColumnDefinitions>
${indent(mainContent, 4)}
    <Grid Grid.Column="1" Margin="22,0,0,0" VerticalAlignment="Top">
${indent(renderMetadataPane(widthKey), 8)}
    </Grid>
</Grid>`;
}

const pageSketchBackdrop = `<Grid IsHitTestVisible="False">
    <Grid.Style>
        <Style TargetType="Grid">
            <Style.Triggers>
                <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                    <Setter Property="Visibility" Value="Collapsed" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Grid.Style>
    <Rectangle Fill="{DynamicResource FrameBrush}" Opacity="0.045"
               OpacityMask="{DynamicResource LocalChalkGrainMask}" />
    <Rectangle Fill="{DynamicResource FrameBrush}" Opacity="0.075"
               OpacityMask="{DynamicResource LocalSketchHatchMask}" />
    <Rectangle Width="320" Height="240" HorizontalAlignment="Left" VerticalAlignment="Bottom"
               Fill="{DynamicResource GlyphBrush}" Opacity="0.12"
               OpacityMask="{DynamicResource LocalHalftoneDoodleMask}" RenderTransformOrigin="0.5,0.5">
        <Rectangle.RenderTransform>
            <ScaleTransform ScaleX="-1" />
        </Rectangle.RenderTransform>
    </Rectangle>
</Grid>`;

const detailsXaml = `<!--
    Canister: Views/DetailsViewGameOverview.xaml (generated by art/gen-overviews.mjs).
    - Nocturnal alley hero banner (GameBannerHeight=320, spacer x * 204 / 320 floor 18) with
      Deep Sewer GameBannerTintBrush darkening + 50% floor and dual chromatic transition hairline.
    - Header: Dual-chromatic framed icon + Anton chromatic title + Golden Marker Masking-Tape PlayButton +
      Leo Cobalt RunningActionIndicator + equal 40x40 icon-only SecondaryButton More & Edit.
    - Body: SteamScreenshotsGameScope + tape-headed Description/Notes beside the Pinned Torn Spiral-Notebook
      Flyer Metadata Dossier (GameDetailsPaneWidth=300 usable width, GameDetailsPanePosition Left/Center/Stretch/Right).
    - Empty state: Comic-shard sticker EmptyGameTemplate centered in ViewportHeight (PART_ScrollViewHost Visible).
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
${indent(pageSketchBackdrop, 28)}
${indent(heroBanner, 28)}
                            <StackPanel Margin="26,0,26,28">
${indent(hideWhenNoGame('StackPanel'), 32)}
${indent(bannerSpacer('x * 204 / 320', 18, 'DetailsBannerSpacer'), 32)}
                                <DockPanel Margin="0,8,0,14">
                                    <StackPanel Orientation="Horizontal" DockPanel.Dock="Right" VerticalAlignment="Center" Margin="18,0,0,0">
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
    Canister: Views/GridViewGameOverview.xaml (generated by art/gen-overviews.mjs).
    - Nocturnal alley hero banner (GameBannerHeight=320, spacer x * 196 / 320 floor 14).
    - CloseGameSideBarCommand: custom 28x28 Hand-Inked Comic Sticker Square turning Tag Crimson on hover;
      inline sticky left of game icon below 120px or when ShowBackgroundImageOnWindow=True, corner 12,12 otherwise.
    - Actions under title: Golden Marker Masking-Tape PlayButton + Leo Cobalt RunningActionIndicator + equal 40x40 More & Edit.
    - Pinned Torn Spiral-Notebook Flyer Metadata Dossier (GridDetailsPaneWidth=300 usable width, GameDetailsPanePosition).
    - Empty state: Comic-shard sticker EmptyGameTemplate centered in ViewportHeight when Game is null.
-->
<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">
    <Style TargetType="GridViewGameOverview">
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="GridViewGameOverview">
                    <Border BorderBrush="{DynamicResource PanelSeparatorBrush}">
                        <Border.Style>
                            <Style TargetType="Border">
                                <Setter Property="BorderThickness" Value="1.5,0,0,0" />
                                <Style.Triggers>
                                    <DataTrigger Binding="{Settings GridViewDetailsPosition}" Value="Left"><Setter Property="BorderThickness" Value="0,0,1.5,0" /></DataTrigger>
                                    <DataTrigger Binding="{Settings ShowPanelSeparators}" Value="False"><Setter Property="BorderThickness" Value="0" /></DataTrigger>
                                </Style.Triggers>
                            </Style>
                        </Border.Style>
                        <Grid>
                            <ScrollViewer CanContentScroll="False" x:Name="PART_ScrollViewHost" Visibility="Visible" HorizontalScrollBarVisibility="Disabled" VerticalScrollBarVisibility="Visible">
                                <Grid x:Name="PageRoot" UseLayoutRounding="True">
${indent(pageRootStyle(), 36)}
${indent(pageSketchBackdrop, 36)}
                                    <Rectangle Width="192" HorizontalAlignment="Left" Fill="{DynamicResource FrameBrush}" Opacity="0.09"
                                               OpacityMask="{DynamicResource LocalSidepanelSketchMask}" IsHitTestVisible="False">
                                        <Rectangle.Style>
                                            <Style TargetType="Rectangle">
                                                <Style.Triggers>
                                                    <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                                                        <Setter Property="Visibility" Value="Collapsed" />
                                                    </DataTrigger>
                                                </Style.Triggers>
                                            </Style>
                                        </Rectangle.Style>
                                    </Rectangle>
${indent(heroBanner, 36)}
                                    <StackPanel Panel.ZIndex="2" Margin="22,0,22,26">
${indent(hideWhenNoGame('StackPanel'), 40)}
${indent(bannerSpacer('x * 196 / 320', 14, 'GridBannerSpacer'), 40)}
                                        <StackPanel Panel.ZIndex="2" Margin="0,8,0,14">
                                            <DockPanel Panel.ZIndex="2">
${indent(inlineCloseButton(), 48)}
${indent(iconPlate(42), 48)}
${indent(titleStack, 48)}
                                            </DockPanel>
                                            <StackPanel Orientation="Horizontal" Margin="0,12,0,0">
${indent(actionsRow, 48)}
                                            </StackPanel>
                                        </StackPanel>
${indent(renderTwoColumnBody('GridDetailsPaneWidth'), 40)}
                                    </StackPanel>
${indent(emptyState, 36)}
                                </Grid>
                            </ScrollViewer>
${indent(sidePanelCloseButton({ template: canisterCloseTemplate, comment: '' }), 28)}
                        </Grid>
                    </Border>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;

writeOverviews(out, detailsXaml, gridXaml);
