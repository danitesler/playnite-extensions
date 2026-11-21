/**
 * Rushdown overview generator (DetailsViewGameOverview.xaml & GridViewGameOverview.xaml).
 * Emits Rushdown's midnight indigo-obsidian & Battle Settings / World Tour game pages:
 * - Fighting Ground laser-ruled stage bezel (Cyan side walls + 2px Neon Magenta top laser rail +
 *   GameBannerDarken & 50% floor + clean GameOverviewBackgroundBrush bottom scrim).
 * - Proportional MathConverter spacer with minimum top gutter at 0/5/10/20px and collapsed banner heights.
 * - Header: Rajdhani Bold display title + Neon-Magenta-to-Cyan underline + 45-degree chamfered PlayButton +
 *   RunningActionIndicator + equal 40x40 icon-only SecondaryButton More & Edit.
 * - Metadata pane: Battle Settings Dossier card crowned by a diagonal Battle Hub Cyan header ribbon with
 *   Challenger Gold top-left triangle & 3 slanted Drive ticks, 10px diamond-capped dividers (DividerTemplate)
 *   between all 6 Playnite groups, 300px usable inner width, GameDetailsPanePosition Left/Center/Stretch/Right.
 * - Empty state: Rushdown Loading-Screen 3D Isometric Graffiti Cube EmptyGameTemplate centered in ViewportHeight.
 * - Grid side panel: custom 28x28 chamfered battle capsule SidePanelCloseButton (inline sticky below 120px or
 *   when ShowBackgroundImageOnWindow=True; top-left corner at >= 120px and whenever Game is null).
 *
 * Usage:
 *   node src/themes/Rushdown/art/gen-overviews.mjs [src/themes/Rushdown/src]
 */

import {
  META_GROUPS,
  bannerDarkeningFloor,
  bannerSpacer,
  heroVisibilityStyle,
  hideWhenNoGame,
  indent,
  inlineCloseButton,
  metadataValue,
  pageRootStyle,
  resolveThemeSrcDir,
  sidePanelCloseButton,
  steamGameScope,
  writeOverviews,
} from '../../../../scripts/overview-generator.mjs';

const out = resolveThemeSrcDir(import.meta.url);

// Custom 28x28 45-degree top-right & bottom-left chamfered battle capsule (Burnout Crimson hover)
const rushdownCloseTemplate = `<ControlTemplate TargetType="{x:Type Button}">
    <Grid Background="Transparent" SnapsToDevicePixels="True">
        <Path x:Name="OuterFrame" Data="M 0,0 L 22,0 L 28,6 L 28,28 L 6,28 L 0,22 Z"
              Fill="{DynamicResource ButtonBorderBrush}" IsHitTestVisible="False" />
        <Path x:Name="Face" Data="M 1.5,1.5 L 21.4,1.5 L 26.5,6.6 L 26.5,26.5 L 6.6,26.5 L 1.5,21.4 Z"
              Fill="{DynamicResource ButtonBackgroundBrush}" IsHitTestVisible="False" />
        <Path x:Name="HoverPlate" Data="M 1.5,1.5 L 21.4,1.5 L 26.5,6.6 L 26.5,26.5 L 6.6,26.5 L 1.5,21.4 Z"
              Fill="{DynamicResource DangerBrush}" Opacity="0" IsHitTestVisible="False" />
        <Rectangle Width="6" Height="2" Margin="2,0,0,2" HorizontalAlignment="Left" VerticalAlignment="Bottom"
                   Fill="{DynamicResource LocalMagentaNeonBrush}" IsHitTestVisible="False" />
        <ContentControl x:Name="Glyph" Width="13" Height="13" HorizontalAlignment="Center" VerticalAlignment="Center"
                        IsHitTestVisible="False" Content="{DynamicResource IconWindowClose}" ContentTemplate="{DynamicResource IconTemplate}"
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
            <Setter TargetName="HoverPlate" Property="Opacity" Value="0.72" />
        </Trigger>
    </ControlTemplate.Triggers>
</ControlTemplate>`;

function renderMetadata(prefix, isGrid) {
  const widthKey = isGrid ? 'GridDetailsPaneWidth' : 'GameDetailsPaneWidth';
  const colDefs = isGrid
    ? '<ColumnDefinition Width="2*" /><ColumnDefinition Width="12" /><ColumnDefinition Width="3*" />'
    : '<ColumnDefinition Width="108" /><ColumnDefinition Width="10" /><ColumnDefinition Width="*" />';

  const blocks = META_GROUPS.map(([groupName, fields]) => {
    const conds = fields.map(([name]) => `<Condition Binding="{Binding Visibility, ElementName=PART_Elem${name}}" Value="Collapsed" />`);
    const collapseTrigger = fields.length === 1
      ? `<DataTrigger Binding="{Binding Visibility, ElementName=PART_Elem${fields[0][0]}}" Value="Collapsed"><Setter Property="Visibility" Value="Collapsed" /></DataTrigger>`
      : `<MultiDataTrigger><MultiDataTrigger.Conditions>${conds.join('')}</MultiDataTrigger.Conditions><Setter Property="Visibility" Value="Collapsed" /></MultiDataTrigger>`;

    const rows = fields.map(([name, loc, kind, part]) => {
      let val = metadataValue(kind, part);
      if (kind === 'score') {
        const isCritic = part === 'PART_TextCriticScore';
        const isCommunity = part === 'PART_TextCommunityScore';
        const barFill = isCritic ? 'LocalScorePinkBrush' : isCommunity ? 'LocalScoreBlueBrush' : 'LocalDriveBlockFillBrush';
        const barStroke = (!isCritic && !isCommunity) ? 'LocalDriveBlockRimBrush' : 'PrimaryButtonForegroundBrush';
        const glowEff = isCritic ? 'LocalScorePinkGlowEffect' : isCommunity ? 'LocalScoreBlueGlowEffect' : 'LocalScoreGreenGlowEffect';
        val = `<StackPanel Orientation="Horizontal" VerticalAlignment="Center">
            <Path Width="48" Height="11" Margin="0,0,9,0" VerticalAlignment="Center" Stretch="Fill"
                  Data="M 1,1 L 39,1 L 46,10 L 8,10 Z"
                  Fill="{DynamicResource ${barFill}}"
                  Stroke="{DynamicResource ${barStroke}}" StrokeThickness="1.5"
                  Effect="{DynamicResource ${glowEff}}" IsHitTestVisible="False" />
            <TextBlock x:Name="${part}" Style="{DynamicResource TextBlockGameScore}" Effect="{DynamicResource ${glowEff}}" VerticalAlignment="Center" />
        </StackPanel>`;
      }
      return `<Border x:Name="PART_Elem${name}" Margin="0,4">
    <Grid>
        <Grid.ColumnDefinitions>${colDefs}</Grid.ColumnDefinitions>
        <TextBlock Grid.Column="0" Text="{DynamicResource ${loc}}" FontSize="{DynamicResource FontSizeSmall}" FontWeight="Medium" Foreground="{DynamicResource TextBrushDarker}" TextWrapping="Wrap" Margin="0,2,0,0" />
        <Border Grid.Column="2">${val}</Border>
    </Grid>
</Border>`;
    }).join('\n');

    return `<Border x:Name="${groupName}" Margin="0,6,0,0">
    <Border.Style>
        <Style TargetType="Border">
            <Style.Triggers>
                ${collapseTrigger}
            </Style.Triggers>
        </Style>
    </Border.Style>
    <StackPanel>
        <Control Template="{DynamicResource DividerTemplate}" Foreground="{DynamicResource NormalBorderBrush}" Margin="0,0,0,8" Focusable="False" IsTabStop="False" />
${indent(rows, 8)}
    </StackPanel>
</Border>`;
  }).join('\n');

  return `<!-- Rushdown Pause-Mode Translucent Teal-Indigo Glass Metadata Dossier (300px usable inner content width) -->
<Border VerticalAlignment="Top" HorizontalAlignment="Stretch"
        Background="{DynamicResource LocalTealGlassCardBrush}"
        BorderBrush="{DynamicResource LocalTealBorderBrush}" BorderThickness="1.5"
        CornerRadius="{DynamicResource CornerRadiusLarge}"
        Effect="{DynamicResource LocalTealGlowEffect}">
    <DockPanel>
        <!-- Pause Mode diagonal-cut Luminous Aqua-Teal header ribbon + Sunburst Gold corner + 3 ticks -->
        <Grid DockPanel.Dock="Top" Height="28" Background="{DynamicResource LocalTealBarBrush}" ClipToBounds="True">
            <Rectangle Height="1.5" VerticalAlignment="Bottom" Fill="{DynamicResource LocalTealGlowBrush}" IsHitTestVisible="False" />
            <Grid HorizontalAlignment="Left" IsHitTestVisible="False">
                <Border Background="{DynamicResource LocalTealRibbonBrush}" Padding="16,0,24,0">
                    <TextBlock Text="{DynamicResource LOCGameDetails}" VerticalAlignment="Center"
                               FontFamily="{DynamicResource HeadingFontFamily}" FontWeight="Bold" FontSize="12.5"
                               Foreground="{DynamicResource HeaderBandForegroundBrush}"
                               Effect="{DynamicResource LocalTealGlowEffect}" />
                </Border>
                <!-- Slanted diagonal cut at ribbon right edge -->
                <Path Data="M 14,0 L 14,28 L 0,28 Z" HorizontalAlignment="Right" Stretch="None"
                      Fill="{DynamicResource LocalTealBarBrush}" />
                <!-- Top-left Sunburst Gold corner accent -->
                <Path Data="M 0,0 L 12,0 L 0,12 Z" HorizontalAlignment="Left" VerticalAlignment="Top"
                      Fill="{DynamicResource LocalChallengerGoldBrush}" />
            </Grid>
            <StackPanel Orientation="Horizontal" HorizontalAlignment="Right" VerticalAlignment="Center" Margin="0,0,10,0" IsHitTestVisible="False">
                <Border Width="8" Height="7" Margin="0,0,3,0" Background="{DynamicResource LocalMagentaNeonBrush}" RenderTransformOrigin="0.5,0.5">
                    <Border.RenderTransform><SkewTransform AngleX="-24" /></Border.RenderTransform>
                </Border>
                <Border Width="8" Height="7" Margin="0,0,3,0" Background="{DynamicResource LocalTealGlowBrush}" RenderTransformOrigin="0.5,0.5">
                    <Border.RenderTransform><SkewTransform AngleX="-24" /></Border.RenderTransform>
                </Border>
                <Border Width="8" Height="7" Background="{DynamicResource LocalChallengerGoldBrush}" RenderTransformOrigin="0.5,0.5">
                    <Border.RenderTransform><SkewTransform AngleX="-24" /></Border.RenderTransform>
                </Border>
            </StackPanel>
        </Grid>
        <Border Padding="14,10,14,12">
            <StackPanel Width="{DynamicResource ${widthKey}}">
                <Grid ClipToBounds="True">
                    <StackPanel Margin="0,-24,0,-4">
${indent(blocks, 24)}
                    </StackPanel>
                </Grid>
            </StackPanel>
        </Border>
    </DockPanel>
</Border>`;
}

const sectionHeading = (loc, altMarker = false) => `<DockPanel Margin="0,0,0,10">
    <Grid DockPanel.Dock="Left" Margin="0,0,10,0" VerticalAlignment="Center">
        <Border Background="{DynamicResource ${altMarker ? 'LocalHeaderGradientBrush' : 'LocalTealRibbonBrush'}}"
                Padding="10,2,20,2" CornerRadius="2,0,0,2"
                Effect="{DynamicResource ${altMarker ? 'LocalSubtleGlowEffect' : 'LocalTealGlowEffect'}}">
            <StackPanel Orientation="Horizontal" VerticalAlignment="Center">
                <Border Width="6" Height="6" Margin="0,0,7,0" VerticalAlignment="Center"
                        Background="{DynamicResource ${altMarker ? 'SelectedBorderBrush' : 'LocalGoldRimBrush'}}"
                        RenderTransformOrigin="0.5,0.5" IsHitTestVisible="False">
                    <Border.RenderTransform><RotateTransform Angle="45" /></Border.RenderTransform>
                </Border>
                <TextBlock Text="{DynamicResource ${loc}}" Style="{DynamicResource HeadingTextBlock}" FontSize="13.5" VerticalAlignment="Center" />
            </StackPanel>
        </Border>
        <Path Data="M 12,0 L 12,24 L 0,24 Z" HorizontalAlignment="Right" VerticalAlignment="Stretch" Stretch="Fill" Width="12"
              Fill="{DynamicResource ContentBackgroundBrush}" IsHitTestVisible="False" />
    </Grid>
    <Rectangle Height="1.5" VerticalAlignment="Center" Fill="{DynamicResource ${altMarker ? 'NormalBorderBrush' : 'LocalTealBorderBrush'}}" IsHitTestVisible="False" />
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
                </Style.Triggers>
            </Style>
        </Grid.Style>
        <Control x:Name="SteamScreenshotsSkeleton" Tag="{Binding Game.Id, NotifyOnTargetUpdated=True}" Visibility="Collapsed"
                 Margin="0,0,0,18" Template="{DynamicResource SteamScreenshotsSkeletonTemplate}"
                 Foreground="{DynamicResource FrameBrush}" Focusable="False">
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
${indent(sectionHeading('LOCGameDescriptionTitle', true), 8)}
        <Border Padding="0,2,0,0">
            <HtmlTextView x:Name="PART_HtmlDescription" HtmlFontFamily="{DynamicResource FontFamily}" HtmlFontSize="{DynamicResource FontSize}"
                          TextElement.Foreground="{DynamicResource TextBrush}"
                          Tag="{DynamicResource LinkBrush}"
                          HtmlForeground="{Binding Path=(TextElement.Foreground).Color, RelativeSource={RelativeSource Self}}"
                          LinkForeground="{Binding Tag.Color, RelativeSource={RelativeSource Self}}" />
        </Border>
    </StackPanel>
    <StackPanel x:Name="PART_ElemNotes" Margin="0,20,0,0">
${indent(sectionHeading('LOCNotesLabel', false), 8)}
        <TextBox x:Name="PART_TextNotes" IsReadOnly="True" TextWrapping="Wrap" Style="{DynamicResource LocalNotesTextBox}" />
    </StackPanel>
</StackPanel>`;

const heroBanner = `<Grid x:Name="HeroArt" VerticalAlignment="Top" IsHitTestVisible="False">
${indent(heroVisibilityStyle(), 4)}
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill" />
${indent(bannerDarkeningFloor(), 4)}
    <!-- Clean page-matched bottom gradient fade (no top outline over cover art; no OpacityMask behind PlayButton) -->
    <Rectangle>
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                <GradientStop Color="#00000000" Offset="0.22" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="0.84" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
</Grid>`;

const actionsRow = `<Grid MinWidth="162" Height="42">
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

const titleStack = `<TextBlock x:Name="PART_TextDisplayName"
           VerticalAlignment="Center"
           FontFamily="{DynamicResource HeadingFontFamily}" FontWeight="Bold"
           FontSize="{DynamicResource FontSizeLargest}" Foreground="{DynamicResource HeadingForegroundBrush}"
           Effect="{DynamicResource LocalTitleGlowEffect}"
           TextWrapping="Wrap" />`;

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
    <Control Template="{DynamicResource EmptyGameTemplate}" Foreground="{DynamicResource FrameBrush}" Focusable="False" />
</Grid>`;

function renderTwoColumnBody(prefix, isGrid) {
  return `<Grid Margin="0,14,0,0">
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="*" />
        <ColumnDefinition Width="Auto" />
    </Grid.ColumnDefinitions>
${indent(mainContent, 4)}
    <Grid Grid.Column="1" Margin="24,0,0,0" VerticalAlignment="Top">
${indent(renderMetadata(prefix, isGrid), 8)}
    </Grid>
</Grid>`;
}

const detailsXaml = `<!--
    Rushdown: Views/DetailsViewGameOverview.xaml (generated by art/gen-overviews.mjs).
    - Fighting Ground laser-ruled stage bezel (GameBannerHeight=320, spacer x * 214 / 320 floor 18) with GameBannerDarken + 50% floor.
    - Header: Game icon + Rajdhani Bold title + Neon-Magenta-to-Cyan underline + 45-degree chamfered PlayButton +
      RunningActionIndicator + equal 40x40 icon-only SecondaryButton More & Edit.
    - Body: SteamScreenshotsGameScope + Description/Notes alongside Battle Settings Metadata Dossier
      (300px usable inner width, diagonal Battle Hub Cyan header ribbon, diamond-capped dividers, GameDetailsPanePosition).
    - Empty state: Rushdown Loading-Screen 3D Isometric Graffiti Cube EmptyGameTemplate (PART_ScrollViewHost Visible).
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
                            <StackPanel Margin="26,0,26,26">
${indent(hideWhenNoGame('StackPanel'), 32)}
${indent(bannerSpacer('x * 214 / 320', 18, 'DetailsBannerSpacer'), 32)}
                                <DockPanel Margin="0,10,0,14">
                                    <StackPanel Orientation="Horizontal" DockPanel.Dock="Right" VerticalAlignment="Center" Margin="18,0,0,0">
${indent(actionsRow, 40)}
                                    </StackPanel>
                                    <DockPanel>
                                        <Border DockPanel.Dock="Left" Width="46" Height="46" Margin="0,0,14,0" VerticalAlignment="Center"
                                                Background="{DynamicResource NormalBrushDark}" BorderBrush="{DynamicResource FocusBrush}"
                                                BorderThickness="1.5" CornerRadius="{DynamicResource ControlCornerRadius}">
                                            <Border.Style>
                                                <Style TargetType="Border">
                                                    <Style.Triggers>
                                                        <DataTrigger Binding="{Binding Source, ElementName=PART_ImageIcon}" Value="{x:Null}">
                                                            <Setter Property="Visibility" Value="Collapsed" />
                                                        </DataTrigger>
                                                    </Style.Triggers>
                                                </Style>
                                            </Border.Style>
                                            <Image x:Name="PART_ImageIcon" MaxWidth="40" MaxHeight="40" HorizontalAlignment="Center" VerticalAlignment="Center" />
                                        </Border>
${indent(titleStack, 40)}
                                    </DockPanel>
                                </DockPanel>
${indent(renderTwoColumnBody('Details', false), 32)}
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
    Rushdown: Views/GridViewGameOverview.xaml (generated by art/gen-overviews.mjs).
    - Fighting Ground laser-ruled stage bezel (GameBannerHeight=320, spacer x * 198 / 320 floor 14) with GameBannerDarken + 50% floor.
    - CloseGameSideBarCommand: custom 28x28 45-degree chamfered battle capsule with Burnout Crimson hover;
      inline sticky left of icon when GameBannerHeight < 120 or ShowBackgroundImageOnWindow=True, corner 12,12 otherwise.
    - Actions under title: PlayButton + RunningActionIndicator + equal 40x40 SecondaryButton More & Edit.
    - Battle Settings Metadata Dossier (GridDetailsPaneWidth=300 usable width, 2*:3* columns, GameDetailsPanePosition).
    - Empty state: Rushdown 3D Isometric Graffiti Cube EmptyGameTemplate centered in ViewportHeight when Game is null.
-->
<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">
    <Style TargetType="GridViewGameOverview">
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="GridViewGameOverview">
                    <Border BorderBrush="{DynamicResource WindowPanelSeparatorBrush}">
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
                                    <StackPanel Panel.ZIndex="2" Margin="24,0,24,26">
${indent(hideWhenNoGame('StackPanel'), 40)}
${indent(bannerSpacer('x * 198 / 320', 14, 'GridBannerSpacer'), 40)}
                                        <StackPanel Panel.ZIndex="2" Margin="0,10,0,14">
                                            <DockPanel Panel.ZIndex="2">
${indent(inlineCloseButton(), 48)}
                                                <Border DockPanel.Dock="Left" Width="44" Height="44" Margin="0,0,14,0" VerticalAlignment="Center"
                                                        Background="{DynamicResource NormalBrushDark}" BorderBrush="{DynamicResource FocusBrush}"
                                                        BorderThickness="1.5" CornerRadius="{DynamicResource ControlCornerRadius}">
                                                    <Border.Style>
                                                        <Style TargetType="Border">
                                                            <Style.Triggers>
                                                                <DataTrigger Binding="{Binding Source, ElementName=PART_ImageIcon}" Value="{x:Null}">
                                                                    <Setter Property="Visibility" Value="Collapsed" />
                                                                </DataTrigger>
                                                            </Style.Triggers>
                                                        </Style>
                                                    </Border.Style>
                                                    <Image x:Name="PART_ImageIcon" MaxWidth="38" MaxHeight="38" HorizontalAlignment="Center" VerticalAlignment="Center" />
                                                </Border>
${indent(titleStack, 48)}
                                            </DockPanel>
                                            <StackPanel Orientation="Horizontal" Margin="0,14,0,0">
${indent(actionsRow, 48)}
                                            </StackPanel>
                                        </StackPanel>
${indent(renderTwoColumnBody('Grid', true), 40)}
                                    </StackPanel>
${indent(emptyState, 36)}
                                </Grid>
                            </ScrollViewer>
${indent(sidePanelCloseButton({ template: rushdownCloseTemplate, comment: '' }), 28)}
                        </Grid>
                    </Border>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;

writeOverviews(out, detailsXaml, gridXaml);
