// Generates Ditherwake DetailsViewGameOverview.xaml & GridViewGameOverview.xaml from shared overview helpers.
// Usage: node src/themes/Ditherwake/art/gen-overviews.mjs
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

// Custom 28x28 E.I.C. Double-Ruled Copperplate Wax-Seal Close Stamp: #2E3037 slate surface with 1.5px Vellum rim +
// inset 1px copperplate ring + 13px Vellum IconWindowClose; hover stamps E.I.C. Sealing-Wax Crimson (#B83228).
const ditherwakeCloseTemplate = `<ControlTemplate TargetType="{x:Type Button}">
    <Grid Background="Transparent" SnapsToDevicePixels="True">
        <Border x:Name="Plate" Background="{DynamicResource NormalBrush}"
                BorderBrush="{DynamicResource LocalVellumBrush}" BorderThickness="1.5"
                CornerRadius="0">
            <Grid ClipToBounds="True">
                <Border x:Name="HoverPlate" CornerRadius="0"
                        Background="{DynamicResource DangerBrush}" Opacity="0" IsHitTestVisible="False" />
                <Border x:Name="InnerRule" Margin="2"
                        BorderBrush="{DynamicResource LocalZenithAmberBrush}" BorderThickness="1"
                        Opacity="0.75" IsHitTestVisible="False" />
                <ContentControl x:Name="Glyph" Width="13" Height="13"
                                HorizontalAlignment="Center" VerticalAlignment="Center"
                                IsHitTestVisible="False" Content="{DynamicResource IconWindowClose}"
                                ContentTemplate="{DynamicResource IconTemplate}" Foreground="{DynamicResource TextBrush}" />
            </Grid>
        </Border>
    </Grid>
    <ControlTemplate.Triggers>
        <Trigger Property="IsMouseOver" Value="True">
            <Setter TargetName="Plate" Property="BorderBrush" Value="{DynamicResource LocalVellumBrightBrush}" />
            <Setter TargetName="InnerRule" Property="BorderBrush" Value="{DynamicResource LocalVellumBrightBrush}" />
            <Setter TargetName="Glyph" Property="Foreground" Value="{DynamicResource DangerForegroundBrush}" />
            <Trigger.EnterActions>
                <BeginStoryboard><Storyboard>
                    <DoubleAnimation Storyboard.TargetName="HoverPlate" Storyboard.TargetProperty="Opacity" To="1" Duration="0:0:0.11" />
                </Storyboard></BeginStoryboard>
            </Trigger.EnterActions>
            <Trigger.ExitActions>
                <BeginStoryboard><Storyboard>
                    <DoubleAnimation FillBehavior="Stop" Storyboard.TargetName="HoverPlate" Storyboard.TargetProperty="Opacity" To="0" Duration="0:0:0.15" />
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
  captionFontWeight: 'Normal',
  captionFontSize: 'FontSizeSmall',
  captionForeground: 'TextBrushDarker',
  captionVerticalAlignment: 'Top',
  captionStackMargin: '0,2,0,0',
  valueOptions: { chipsMargin: '0,0,0,-4', itemsWrapPanel: true },
};

// Copperplate compass-diamond & Bayer-dot divider between metadata groups (Height=10 + Margin bottom 6 = 16; group top 10 = 26).
const groupBreak = `<Control Template="{DynamicResource DividerTemplate}" Focusable="False" IsTabStop="False" IsHitTestVisible="False"
         Margin="0,0,0,6" />`;

// E.I.C. Double-Ruled Crew Manifest & Assessment Ledger: 1.5px Vellum outer rule + 3px gutter + 1px inner copperplate
// frame + four carved corner rosette squares + hanging top-right Zenith Amber swallowtail bookmark ribbon
// framing 300px of calm #212329 metadata content.
function renderMetadataPane(widthKey) {
  const blocks = META_GROUPS.map(g => metadataGroup(g, 'stack', {
    margin: '0,10,0,0',
    padding: '0',
    borderThickness: '',
    borderBrush: '',
    beforeFields: groupBreak,
    fieldOptions,
  })).join('\n');

  return `<Border VerticalAlignment="Top" SnapsToDevicePixels="True"
        Background="{DynamicResource PopupBackgroundBrush}"
        BorderBrush="{DynamicResource LocalVellumBrush}" BorderThickness="1.5"
        CornerRadius="0" Padding="3">
    <Border BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="1">
        <Grid ClipToBounds="True">
            <!-- Top 5px Bayer 4x4 ordered-dither woodcut frieze -->
            <Rectangle Height="5" VerticalAlignment="Top"
                       Fill="{DynamicResource LocalZenithAmberBrush}" Opacity="0.42"
                       OpacityMask="{DynamicResource LocalDitherBandMaskBrush}"
                       IsHitTestVisible="False" />

            <!-- Hanging Swallowtail Book-Ribbon Bookmark at top-right -->
            <Path Width="13" Height="20" HorizontalAlignment="Right" VerticalAlignment="Top" Margin="0,0,16,0"
                  Stretch="Fill" Fill="{DynamicResource LocalZenithAmberBrush}"
                  Data="M0,0 H13 V20 L6.5,15 L0,20 Z"
                  IsHitTestVisible="False" />

            <!-- Four carved corner woodcut rosette ticks -->
            <Border Width="6" Height="6" HorizontalAlignment="Left" VerticalAlignment="Top" Margin="3"
                    Background="{DynamicResource ShellBackgroundBrush}" BorderBrush="{DynamicResource LocalZenithAmberBrush}"
                    BorderThickness="1.3" IsHitTestVisible="False" />
            <Border Width="6" Height="6" HorizontalAlignment="Right" VerticalAlignment="Top" Margin="3"
                    Background="{DynamicResource ShellBackgroundBrush}" BorderBrush="{DynamicResource LocalZenithAmberBrush}"
                    BorderThickness="1.3" IsHitTestVisible="False" />
            <Border Width="6" Height="6" HorizontalAlignment="Left" VerticalAlignment="Bottom" Margin="3"
                    Background="{DynamicResource ShellBackgroundBrush}" BorderBrush="{DynamicResource LocalZenithAmberBrush}"
                    BorderThickness="1.3" IsHitTestVisible="False" />
            <Border Width="6" Height="6" HorizontalAlignment="Right" VerticalAlignment="Bottom" Margin="3"
                    Background="{DynamicResource ShellBackgroundBrush}" BorderBrush="{DynamicResource LocalZenithAmberBrush}"
                    BorderThickness="1.3" IsHitTestVisible="False" />

            <Border Padding="14,14,14,12">
                <StackPanel Width="{DynamicResource ${widthKey}}">
                    <Grid ClipToBounds="True">
                        <StackPanel Margin="0,-26,0,-4">
${indent(blocks, 28)}
                        </StackPanel>
                    </Grid>
                </StackPanel>
            </Border>
        </Grid>
    </Border>
</Border>`;
}

const sectionHeading = (loc) => `<DockPanel Margin="0,0,0,10">
    <Path DockPanel.Dock="Left" Width="8" Height="8" Margin="0,0,8,0" VerticalAlignment="Center" Stretch="Fill"
          Data="M4,0 L8,4 L4,8 L0,4 Z"
          Stroke="{DynamicResource LocalZenithAmberBrush}" StrokeThickness="1.4"
          Fill="{DynamicResource ShellBackgroundBrush}" IsHitTestVisible="False" />
    <TextBlock DockPanel.Dock="Left" Text="{DynamicResource ${loc}}" Style="{DynamicResource HeadingTextBlock}" Margin="0,0,10,0" />
    <Rectangle DockPanel.Dock="Right" Width="36" Height="5" Margin="6,0,0,0" VerticalAlignment="Center"
               Fill="{DynamicResource LocalZenithAmberBrush}" Opacity="0.65"
               OpacityMask="{DynamicResource LocalDitherBandMaskBrush}" IsHitTestVisible="False" />
    <Grid Height="3" VerticalAlignment="Center" IsHitTestVisible="False">
        <Rectangle Height="1" VerticalAlignment="Top" Fill="{DynamicResource LocalVellumBrush}" />
        <Rectangle Height="1" VerticalAlignment="Bottom" Fill="{DynamicResource NormalBorderBrush}" />
    </Grid>
</DockPanel>`;

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
    <StackPanel x:Name="PART_ElemNotes" Margin="0,20,0,0">
${indent(sectionHeading('LOCNotesLabel'), 8)}
        <TextBox x:Name="PART_TextNotes" IsReadOnly="True" TextWrapping="Wrap" Style="{DynamicResource LocalNotesTextBox}" />
    </StackPanel>
</StackPanel>`;

const heroBanner = `<Grid x:Name="HeroArt" VerticalAlignment="Top" IsHitTestVisible="False">
${indent(heroVisibilityStyle(), 4)}
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill" />
${indent(bannerDarkeningFloor(), 4)}
    <!-- Woodcut Diptych Chapter Frame: double-ruled copperplate top engraving border with corner rosettes -->
    <Grid Height="12" Margin="24,10,24,0" VerticalAlignment="Top">
        <Rectangle Height="1.5" VerticalAlignment="Top" Fill="{DynamicResource LocalVellumBrush}" Opacity="0.88" />
        <Rectangle Height="1" VerticalAlignment="Top" Margin="6,3.5,6,0" Fill="{DynamicResource NormalBorderBrush}" Opacity="0.8" />
        <Path Width="7" Height="7" HorizontalAlignment="Left" VerticalAlignment="Top" Margin="0,-2.5,0,0" Stretch="Fill"
              Data="M3.5,0 L7,3.5 L3.5,7 L0,3.5 Z"
              Stroke="{DynamicResource LocalZenithAmberBrush}" StrokeThickness="1.3"
              Fill="{DynamicResource ShellBackgroundBrush}" />
        <Path Width="7" Height="7" HorizontalAlignment="Right" VerticalAlignment="Top" Margin="0,-2.5,0,0" Stretch="Fill"
              Data="M3.5,0 L7,3.5 L3.5,7 L0,3.5 Z"
              Stroke="{DynamicResource LocalZenithAmberBrush}" StrokeThickness="1.3"
              Fill="{DynamicResource ShellBackgroundBrush}" />
    </Grid>
    <!-- Smooth vertical fade into #18191D iron-gall slate -->
    <Rectangle>
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                <GradientStop Color="#24141519" Offset="0" />
                <GradientStop Color="#82141519" Offset="0.54" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
    <Rectangle>
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0" EndPoint="1,0">
                <GradientStop Color="#B218191D" Offset="0" />
                <GradientStop Color="#1418191D" Offset="0.46" />
                <GradientStop Color="#6618191D" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
</Grid>`;

const actionsRow = `<Grid MinWidth="172" Height="40">
    <Button x:Name="PART_ButtonPlayAction" Style="{DynamicResource PlayButton}" />
    <Button x:Name="PART_ButtonContextAction" Tag="ContextAction" Style="{DynamicResource PlayButton}" />
    <Control Style="{DynamicResource RunningActionIndicator}" />
</Grid>
<Button x:Name="PART_ButtonMoreActions" Width="40" Height="40" Padding="0" Style="{DynamicResource SecondaryButton}" Margin="8,0,0,0" ToolTip="{DynamicResource LOCMoreAction}">
    <ContentControl Content="{DynamicResource IconOptions}" ContentTemplate="{DynamicResource IconTemplate}" Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
</Button>
<Button x:Name="PART_ButtonEditGame" Width="40" Height="40" Padding="0" Style="{DynamicResource SecondaryButton}" Margin="6,0,0,0" ToolTip="{DynamicResource LOCEditGame}">
    <ContentControl Content="{DynamicResource IconEdit}" ContentTemplate="{DynamicResource IconTemplate}" Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
</Button>`;

const titleStack = `<StackPanel VerticalAlignment="Center">
    <StackPanel Orientation="Horizontal" Margin="0,0,0,5" IsHitTestVisible="False">
        <Rectangle Width="24" Height="1.5" VerticalAlignment="Center" Fill="{DynamicResource LocalVellumBrush}" />
        <Path Width="6" Height="6" Margin="6,0,6,0" VerticalAlignment="Center" Stretch="Fill"
              Data="M3,0 L6,3 L3,6 L0,3 Z"
              Stroke="{DynamicResource LocalZenithAmberBrush}" StrokeThickness="1.2"
              Fill="{DynamicResource ShellBackgroundBrush}" />
        <Rectangle Width="36" Height="3" VerticalAlignment="Center"
                   Fill="{DynamicResource LocalZenithAmberBrush}" Opacity="0.72"
                   OpacityMask="{DynamicResource LocalDitherBandMaskBrush}" />
    </StackPanel>
    <TextBlock x:Name="PART_TextDisplayName" VerticalAlignment="Center"
               FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLargest}"
               FontWeight="Bold" Foreground="{DynamicResource HeadingForegroundBrush}" TextWrapping="Wrap" />
</StackPanel>`;

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

const detailsXaml = `<!--
    Ditherwake: Views/DetailsViewGameOverview.xaml (generated by art/gen-overviews.mjs).
    - Woodcut Diptych Chapter hero banner (GameBannerHeight=300, spacer x * 224 / 300 floor 18) with GameBannerDarken + 50% floor.
    - Header: Double-ruled copperplate game icon + compass-diamond dither eyebrow + Cinzel Bold title +
      Memento Mortem copperplate PlayButton + IBM 5151 Phosphor RunningActionIndicator + equal 40x40 SecondaryButton More & Edit.
    - Body: SteamScreenshotsGameScope + copperplate-headed Description/Notes alongside E.I.C. Double-Ruled Crew Manifest
      (GameDetailsPaneWidth=300 usable width, GameDetailsPanePosition Left / Center / Stretch / Right via
      scripts/game-page-breakpoints.mjs).
    - Empty state: Falmouth Anchorage Manifest & Memento Mortem EmptyGameTemplate centered in ViewportHeight (PART_ScrollViewHost Visible).
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
${indent(heroBanner, 28)}
                            <StackPanel Margin="26,0,26,28">
${indent(hideWhenNoGame('StackPanel'), 32)}
${indent(bannerSpacer('x * 224 / 300', 18, 'DetailsBannerSpacer'), 32)}
                                <DockPanel Margin="0,8,0,14">
                                    <StackPanel Orientation="Horizontal" DockPanel.Dock="Right" VerticalAlignment="Center" Margin="18,0,0,0">
${indent(actionsRow, 40)}
                                    </StackPanel>
                                    <DockPanel>
                                        <Border DockPanel.Dock="Left" VerticalAlignment="Center" Margin="0,0,14,0"
                                                Visibility="{Binding Visibility, ElementName=PART_ImageIcon}"
                                                CornerRadius="0" Padding="2"
                                                Background="{DynamicResource PopupBackgroundBrush}"
                                                BorderBrush="{DynamicResource LocalVellumBrush}" BorderThickness="1.5">
                                            <Border BorderBrush="{DynamicResource LocalZenithAmberBrush}" BorderThickness="1" Padding="1">
                                                <Image x:Name="PART_ImageIcon" MaxWidth="42" MaxHeight="42" />
                                            </Border>
                                        </Border>
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
    Ditherwake: Views/GridViewGameOverview.xaml (generated by art/gen-overviews.mjs).
    - Woodcut Diptych Chapter hero banner (GameBannerHeight=300, spacer x * 214 / 300 floor 14) with GameBannerDarken + 50% floor.
    - CloseGameSideBarCommand: custom 28x28 E.I.C. double-ruled copperplate stamp turning Sealing-Wax Crimson on hover;
      inline sticky left of icon when GameBannerHeight < 120 or ShowBackgroundImageOnWindow=True, corner 12,12 otherwise.
    - Actions under title: Memento Mortem PlayButton + IBM 5151 Phosphor RunningActionIndicator + equal 40x40 SecondaryButton More & Edit.
    - E.I.C. Double-Ruled Crew Manifest (GridDetailsPaneWidth=300 usable width, 2*:3* columns, GameDetailsPanePosition).
    - Empty state: Falmouth Anchorage Manifest & Memento Mortem EmptyGameTemplate centered in ViewportHeight when Game is null.
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
${indent(heroBanner, 36)}
                                    <StackPanel Panel.ZIndex="2" Margin="22,0,22,26">
${indent(hideWhenNoGame('StackPanel'), 40)}
${indent(bannerSpacer('x * 214 / 300', 14, 'GridBannerSpacer'), 40)}
                                        <StackPanel Panel.ZIndex="2" Margin="0,8,0,14">
                                            <DockPanel Panel.ZIndex="2">
${indent(inlineCloseButton(), 48)}
                                                <Border DockPanel.Dock="Left" VerticalAlignment="Center" Margin="0,0,12,0"
                                                        Visibility="{Binding Visibility, ElementName=PART_ImageIcon}"
                                                        CornerRadius="0" Padding="2"
                                                        Background="{DynamicResource PopupBackgroundBrush}"
                                                        BorderBrush="{DynamicResource LocalVellumBrush}" BorderThickness="1.5">
                                                    <Border BorderBrush="{DynamicResource LocalZenithAmberBrush}" BorderThickness="1" Padding="1">
                                                        <Image x:Name="PART_ImageIcon" MaxWidth="40" MaxHeight="40" />
                                                    </Border>
                                                </Border>
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
${indent(sidePanelCloseButton({ template: ditherwakeCloseTemplate, comment: '' }), 28)}
                        </Grid>
                    </Border>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;

writeOverviews(out, detailsXaml, gridXaml);
