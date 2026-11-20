/**
 * Studlock overview generator (DetailsViewGameOverview.xaml & GridViewGameOverview.xaml).
 * Emits Studlock's molded charcoal baseplate & chamfered Cerulean Brick game pages:
 * - Chamfered Cerulean Brick hero bezel (3px top/side rim with brick-seam ticks + GameBannerDarken & 50% floor
 *   + clean GameOverviewBackgroundBrush bottom scrim, zero OpacityMask behind animated Play).
 * - Proportional MathConverter spacer with minimum top gutter at 0/5/10/20px and collapsed banner heights.
 * - Header: Nunito Black Italic display title, brick-seamed Canary Yellow PlayButton + RunningActionIndicator +
 *   equal 40x40 icon-only SecondaryButton More & Edit.
 * - Metadata pane: Chamfered Cerulean Brick ABS Dossier crowned by a segmented Cerulean header strip,
 *   10px molded circular stud-row dividers (DividerTemplate / stud-row.png) between all 6 Playnite groups,
 *   300px usable inner width, GameDetailsPanePosition Left / Center / Stretch / Right via game-page-breakpoints.mjs.
 * - Empty state: Studlock Loading-Screen Golden 2x2 Brick EmptyGameTemplate centered in ViewportHeight.
 * - Grid side panel: custom 28x28 chamfered molded brick SidePanelCloseButton (inline sticky below 120px or
 *   when ShowBackgroundImageOnWindow=True; top-left corner at >= 120px and whenever Game is null).
 *
 * Usage:
 *   node src/themes/Studlock/art/gen-overviews.mjs [src/themes/Studlock/src]
 */

import {
  META_GROUPS,
  bannerDarkeningFloor,
  bannerSpacer,
  heroVisibilityStyle,
  hideWhenNoGame,
  hideWhenNoTitle,
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

// Custom 28x28 chamfered molded ABS brick cap (4px octagonal corner bevels, 2px lower lip, Brick Red hover)
const studlockCloseTemplate = `<ControlTemplate TargetType="{x:Type Button}">
    <Grid Background="Transparent" SnapsToDevicePixels="True">
        <Path x:Name="Lip" Data="M 4,0 L 24,0 L 28,4 L 28,24 L 24,28 L 4,28 L 0,24 L 0,4 Z"
              Fill="{DynamicResource FrameInnerBrush}" IsHitTestVisible="False" />
        <Path x:Name="Face" Data="M 5,1.5 L 23,1.5 L 26.5,5 L 26.5,22 L 23,25.5 L 5,25.5 L 1.5,22 L 1.5,5 Z"
              Fill="{DynamicResource ButtonBackgroundBrush}" IsHitTestVisible="False" />
        <Rectangle Height="1" Width="16" VerticalAlignment="Top" Margin="0,2,0,0"
                   Fill="{DynamicResource BevelLightBrush}" IsHitTestVisible="False" />
        <Path x:Name="HoverPlate" Data="M 5,1.5 L 23,1.5 L 26.5,5 L 26.5,22 L 23,25.5 L 5,25.5 L 1.5,22 L 1.5,5 Z"
              Fill="{DynamicResource DangerBrush}" Opacity="0" IsHitTestVisible="False" />
        <ContentControl x:Name="Glyph" Width="13" Height="13" Margin="0,0,0,1" HorizontalAlignment="Center" VerticalAlignment="Center"
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

    const rows = fields.map(([name, loc, kind, part]) => `<Border x:Name="PART_Elem${name}" Margin="0,4">
    <Grid>
        <Grid.ColumnDefinitions>${colDefs}</Grid.ColumnDefinitions>
        <TextBlock Grid.Column="0" Text="{DynamicResource ${loc}}" FontSize="{DynamicResource FontSizeSmall}" FontWeight="Medium" Foreground="{DynamicResource TextBrushDarker}" TextWrapping="Wrap" Margin="0,2,0,0" />
        <Border Grid.Column="2">${metadataValue(kind, part)}</Border>
    </Grid>
</Border>`).join('\n');

    // Molded horizontal circular stud-row divider before each group (hidden on first visible group via clip margin,
    // and automatically collapsed in Center/Stretch by scripts/game-page-breakpoints.mjs)
    return `<Border x:Name="${groupName}" Margin="0,6,0,0">
    <Border.Style>
        <Style TargetType="Border">
            <Style.Triggers>
                ${collapseTrigger}
            </Style.Triggers>
        </Style>
    </Border.Style>
    <StackPanel>
        <Control Template="{DynamicResource DividerTemplate}" Foreground="{DynamicResource LocalAxleRodBrush}" Margin="0,0,0,8" Focusable="False" IsTabStop="False" />
${indent(rows, 8)}
    </StackPanel>
</Border>`;
  }).join('\n');

  return `<!-- Studlock Chamfered Cerulean Brick ABS Dossier (300px usable inner content width) -->
<Border VerticalAlignment="Top" HorizontalAlignment="Stretch"
        Background="{DynamicResource NormalBrushDark}"
        BorderBrush="{DynamicResource FrameBrush}" BorderThickness="2"
        CornerRadius="{DynamicResource CornerRadiusLarge}" ClipToBounds="True">
    <DockPanel>
        <!-- Segmented Cerulean Brick top header cap -->
        <Grid DockPanel.Dock="Top" Height="24" Background="{DynamicResource HeaderBandBrush}" ClipToBounds="True">
            <Rectangle Fill="{DynamicResource FrameInnerBrush}" Opacity="0.2"
                       OpacityMask="{DynamicResource LocalBrickSeamsMaskBrush}" IsHitTestVisible="False" />
            <Rectangle Height="1.5" VerticalAlignment="Bottom" Fill="{DynamicResource FrameInnerBrush}" IsHitTestVisible="False" />
            <DockPanel Margin="12,0,10,0">
                <StackPanel DockPanel.Dock="Right" Orientation="Horizontal" VerticalAlignment="Center" IsHitTestVisible="False">
                    <Ellipse Width="6" Height="6" Margin="0,0,4,0" Fill="{DynamicResource FrameHoverBrush}" Stroke="{DynamicResource FrameInnerBrush}" StrokeThickness="1" />
                    <Ellipse Width="6" Height="6" Margin="0,0,4,0" Fill="{DynamicResource FrameHoverBrush}" Stroke="{DynamicResource FrameInnerBrush}" StrokeThickness="1" />
                    <Ellipse Width="6" Height="6" Fill="{DynamicResource FrameHoverBrush}" Stroke="{DynamicResource FrameInnerBrush}" StrokeThickness="1" />
                </StackPanel>
                <TextBlock Text="{DynamicResource LOCGameDetails}" VerticalAlignment="Center"
                           FontFamily="{DynamicResource HeadingFontFamily}" FontWeight="Black" FontSize="11"
                           Foreground="{DynamicResource HeaderBandForegroundBrush}" />
            </DockPanel>
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
    <Border DockPanel.Dock="Left" Width="8" Height="14" Margin="0,0,8,0" VerticalAlignment="Center" CornerRadius="2"
            Background="{DynamicResource ${altMarker ? 'HeadingMarkerAltBrush' : 'HeadingMarkerBrush'}}"
            BorderBrush="{DynamicResource FrameInnerBrush}" BorderThickness="1" IsHitTestVisible="False" />
    <TextBlock DockPanel.Dock="Left" Text="{DynamicResource ${loc}}" Style="{DynamicResource HeadingTextBlock}" Margin="0,0,10,0" />
    <Rectangle Height="2" VerticalAlignment="Center" Fill="{DynamicResource HeadingRuleBrush}" IsHitTestVisible="False" />
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
    <!-- Chamfered Cerulean Brick top/side upper bezel with modular brick-seam highlight -->
    <Border Margin="20,10,20,0" BorderBrush="{DynamicResource FrameBrush}" BorderThickness="3,3,3,0"
            CornerRadius="8,8,0,0" Opacity="0.9">
        <Rectangle Height="3" VerticalAlignment="Top" Fill="{DynamicResource TextBrush}" Opacity="0.22"
                   OpacityMask="{DynamicResource LocalBrickSeamsMaskBrush}" />
    </Border>
    <!-- Clean page-matched gradient fade (no OpacityMask behind animated PlayButton) -->
    <Rectangle>
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                <GradientStop Color="#00000000" Offset="0.24" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="0.82" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
</Grid>`;

const actionsRow = `<Grid MinWidth="156" Height="42">
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

const titleStack = `<StackPanel VerticalAlignment="Center">
    <TextBlock x:Name="PART_TextDisplayName"
               FontFamily="{DynamicResource HeadingFontFamily}" FontWeight="Black" FontStyle="Italic"
               FontSize="{DynamicResource FontSizeLargest}" Foreground="{DynamicResource HeadingForegroundBrush}"
               TextWrapping="Wrap" />
    <Border Height="3" Width="96" HorizontalAlignment="Left" Margin="0,5,0,0" CornerRadius="1.5"
            Background="{DynamicResource GlyphBrush}">
${indent(hideWhenNoTitle('Border'), 8)}
    </Border>
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
    Studlock: Views/DetailsViewGameOverview.xaml (generated by art/gen-overviews.mjs).
    - Chamfered Cerulean Brick hero bezel (GameBannerHeight=320, spacer x * 214 / 320 floor 18) with GameBannerDarken + 50% floor.
    - Header: Game icon + Nunito Black Italic title + brick-seamed Canary Yellow PlayButton + RunningActionIndicator
      + equal 40x40 icon-only SecondaryButton More & Edit.
    - Body: SteamScreenshotsGameScope + Description/Notes alongside Chamfered Cerulean ABS Metadata Dossier
      (300px usable inner width, molded stud-row dividers, GameDetailsPanePosition Left / Center / Stretch / Right).
    - Empty state: Studlock Loading-Screen Golden 2x2 Brick EmptyGameTemplate (PART_ScrollViewHost Visible).
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
                            <StackPanel Margin="28,0,28,28">
${indent(hideWhenNoGame('StackPanel'), 32)}
${indent(bannerSpacer('x * 214 / 320', 18, 'DetailsBannerSpacer'), 32)}
                                <DockPanel Margin="0,10,0,14">
                                    <StackPanel Orientation="Horizontal" DockPanel.Dock="Right" VerticalAlignment="Center" Margin="18,0,0,0">
${indent(actionsRow, 40)}
                                    </StackPanel>
                                    <DockPanel>
                                        <Image x:Name="PART_ImageIcon" MaxWidth="46" MaxHeight="46" Margin="0,0,14,0" DockPanel.Dock="Left" VerticalAlignment="Center" />
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
    Studlock: Views/GridViewGameOverview.xaml (generated by art/gen-overviews.mjs).
    - Chamfered Cerulean Brick hero bezel (GameBannerHeight=320, spacer x * 198 / 320 floor 14) with GameBannerDarken + 50% floor.
    - CloseGameSideBarCommand: custom 28x28 chamfered molded ABS brick cap with Brick Red hover;
      inline sticky left of icon when GameBannerHeight < 120 or ShowBackgroundImageOnWindow=True, corner 12,12 otherwise.
    - Actions under title: PlayButton + RunningActionIndicator + equal 40x40 SecondaryButton More & Edit.
    - Chamfered Cerulean ABS Metadata Dossier (GridDetailsPaneWidth=300 usable width, 2*:3* columns, GameDetailsPanePosition).
    - Empty state: Studlock Golden 2x2 Brick EmptyGameTemplate centered in ViewportHeight when Game is null.
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
                                                <Image x:Name="PART_ImageIcon" MaxWidth="44" MaxHeight="44" Margin="0,0,14,0" DockPanel.Dock="Left" VerticalAlignment="Center" />
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
${indent(sidePanelCloseButton({ template: studlockCloseTemplate, comment: '' }), 28)}
                        </Grid>
                    </Border>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;

writeOverviews(out, detailsXaml, gridXaml);
