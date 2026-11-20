/**
 * Vesperglass overview generator (DetailsViewGameOverview.xaml & GridViewGameOverview.xaml).
 * Emits Vesperglass's Codex Metadata Dossier (double rose-copper hairline, subtle astrolabe tile,
 * centered top hollow-diamond crest, all 6 collapsing Playnite metadata groups), hero banner with
 * proportional MathConverter spacer, GameBannerDarken + 50% floor layer, ShowBackgroundImageOnWindow
 * transparency/collapse triggers, SteamScreenshotsGameScope + 12s skeleton, Astrolabe EmptyGameTemplate,
 * and GridView's sticky inline/corner SidePanelCloseButton.
 *
 * Usage:
 *   node src/themes/Vesperglass/art/gen-overviews.mjs [src/themes/Vesperglass/src]
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

function renderMetadata(prefix, isGrid) {
  const widthKey = isGrid ? 'GridDetailsPaneWidth' : 'GameDetailsPaneWidth';
  const colDefs = isGrid
    ? '<ColumnDefinition Width="2*" /><ColumnDefinition Width="12" /><ColumnDefinition Width="3*" />'
    : '<ColumnDefinition Width="106" /><ColumnDefinition Width="10" /><ColumnDefinition Width="*" />';

  const blocks = META_GROUPS.map(([groupName, fields]) => {
    const conds = fields.map(([name]) => `<Condition Binding="{Binding Visibility, ElementName=PART_Elem${name}}" Value="Collapsed" />`);
    const collapseTrigger = fields.length === 1
      ? `<DataTrigger Binding="{Binding Visibility, ElementName=PART_Elem${fields[0][0]}}" Value="Collapsed"><Setter Property="Visibility" Value="Collapsed" /></DataTrigger>`
      : `<MultiDataTrigger><MultiDataTrigger.Conditions>${conds.join('')}</MultiDataTrigger.Conditions><Setter Property="Visibility" Value="Collapsed" /></MultiDataTrigger>`;

    const rows = fields.map(([name, loc, kind, part]) => `<Border x:Name="PART_Elem${name}">
    <Grid>
        <Grid.ColumnDefinitions>${colDefs}</Grid.ColumnDefinitions>
        <TextBlock Grid.Column="0" Text="{DynamicResource ${loc}}" FontSize="{DynamicResource FontSizeSmall}" Foreground="{DynamicResource TextBrushDarker}" TextWrapping="Wrap" Margin="0,2,0,0" />
        <Border Grid.Column="2">${metadataValue(kind, part)}</Border>
    </Grid>
</Border>`).join('\n');

    return `<Border x:Name="${groupName}" Margin="0,12,0,0" Padding="0,12,0,0" BorderThickness="0,1,0,0" BorderBrush="{DynamicResource LocalCopperFaintBrush}">
    <Border.Style>
        <Style TargetType="Border">
            <Style.Triggers>
                ${collapseTrigger}
            </Style.Triggers>
        </Style>
    </Border.Style>
    <StackPanel>
${indent(rows, 8)}
    </StackPanel>
</Border>`;
  }).join('\n');

  return `<!-- Vesperglass Codex Metadata Dossier (double rose-copper hairline, top hollow-diamond crest, 300px usable inner width) -->
<Grid VerticalAlignment="Top" HorizontalAlignment="Stretch" Margin="0,6,0,0">
    <Border Background="{DynamicResource NormalBrush}" BorderBrush="{DynamicResource LocalCopperDimBrush}"
            BorderThickness="1" CornerRadius="{DynamicResource ControlCornerRadius}">
        <Grid>
            <Control Template="{DynamicResource LocalAstrolabeBgTemplate}" Foreground="{DynamicResource FrameBrush}"
                     Opacity="0.038" Focusable="False" IsHitTestVisible="False" />
            <Border Margin="3" BorderBrush="{DynamicResource FrameInnerBrush}" BorderThickness="1" Opacity="0.72"
                    CornerRadius="{DynamicResource CornerRadiusSmall}" IsHitTestVisible="False" />
            <Border Padding="16,14">
                <StackPanel Width="{DynamicResource ${widthKey}}">
                    <Grid ClipToBounds="True">
                        <StackPanel Margin="0,-32,0,-7">
${indent(blocks, 28)}
                        </StackPanel>
                    </Grid>
                </StackPanel>
            </Border>
        </Grid>
    </Border>
    <!-- Centered top hollow-diamond Veilguard Codex crest -->
    <Grid Width="11" Height="11" HorizontalAlignment="Center" VerticalAlignment="Top" Margin="0,-5,0,0" IsHitTestVisible="False">
        <Border Background="{DynamicResource ShellBackgroundBrush}" BorderBrush="{DynamicResource FrameBrush}" BorderThickness="1" RenderTransformOrigin="0.5,0.5">
            <Border.RenderTransform><RotateTransform Angle="45" /></Border.RenderTransform>
        </Border>
        <Border Width="4" Height="4" Background="{DynamicResource LocalAmethystBrightBrush}" HorizontalAlignment="Center" VerticalAlignment="Center" RenderTransformOrigin="0.5,0.5">
            <Border.RenderTransform><RotateTransform Angle="45" /></Border.RenderTransform>
        </Border>
    </Grid>
</Grid>`;
}

const sectionHeading = (loc) => `<DockPanel Margin="0,0,0,10">
    <Border DockPanel.Dock="Left" Width="6" Height="6" Margin="0,0,9,0" VerticalAlignment="Center"
            Background="{DynamicResource HeadingMarkerBrush}" BorderBrush="{DynamicResource FrameBrush}" BorderThickness="1"
            RenderTransformOrigin="0.5,0.5" IsHitTestVisible="False">
        <Border.RenderTransform><RotateTransform Angle="45" /></Border.RenderTransform>
    </Border>
    <TextBlock DockPanel.Dock="Left" Text="{DynamicResource ${loc}}" Style="{DynamicResource HeadingTextBlock}" Margin="0,0,12,0" />
    <Rectangle Height="1" VerticalAlignment="Center" Fill="{DynamicResource HeadingRuleBrush}">
        <Rectangle.OpacityMask>
            <LinearGradientBrush StartPoint="0,0" EndPoint="1,0">
                <GradientStop Color="#FF000000" Offset="0" />
                <GradientStop Color="#00000000" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.OpacityMask>
    </Rectangle>
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
                 Foreground="{DynamicResource LocalCopperDimBrush}" Focusable="False">
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
                      TextElement.Foreground="{DynamicResource TextBrush}" Tag="{DynamicResource LinkBrush}"
                      HtmlForeground="{Binding Path=(TextElement.Foreground).Color, RelativeSource={RelativeSource Self}}"
                      LinkForeground="{Binding Tag.Color, RelativeSource={RelativeSource Self}}" />
    </StackPanel>
    <StackPanel x:Name="PART_ElemNotes" Margin="0,20,0,0">
${indent(sectionHeading('LOCNotesLabel'), 8)}
        <TextBox x:Name="PART_TextNotes" IsReadOnly="True" TextWrapping="Wrap" Style="{DynamicResource BareTextBox}" Foreground="{DynamicResource TextBrush}" />
    </StackPanel>
</StackPanel>`;

const heroBanner = `<Grid x:Name="HeroArt" VerticalAlignment="Top" IsHitTestVisible="False">
${indent(heroVisibilityStyle(), 4)}
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill" />
${indent(bannerDarkeningFloor(), 4)}
    <Rectangle Height="88" VerticalAlignment="Top" Opacity="0.55">
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="0" />
                <GradientStop Color="#00000000" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
    <Rectangle>
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                <GradientStop Color="#00000000" Offset="0.18" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
</Grid>`;

const actionsRow = `<Grid MinWidth="176" Height="40">
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

const titleStack = `<StackPanel VerticalAlignment="Center">
    <TextBlock x:Name="PART_TextDisplayName" FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLargest}"
               FontWeight="Bold" Foreground="{DynamicResource HeadingForegroundBrush}" TextWrapping="Wrap" />
    <Control Template="{DynamicResource DividerTemplate}" Foreground="{DynamicResource FrameBrush}"
             BorderBrush="{DynamicResource HeadingRuleBrush}" Focusable="False"
             Height="9" HorizontalAlignment="Stretch" Margin="0,4,0,0">
${indent(hideWhenNoTitle('Control'), 8)}
    </Control>
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
    Vesperglass: game page, details view (generated by art/gen-overviews.mjs).
    - Banner (GameBannerHeight=300) with GameBannerDarken + 50% floor, soft page-color fade, spacer x * 158 / 300 (floor 20).
    - Header: Game icon + carved Cinzel Bold title + tapered copper-diamond rule; pointed-hexagonal PlayButton +
      RunningActionIndicator + equal 40x40 icon-only SecondaryButton More & Edit.
    - Body: SteamScreenshotsGameScope + Description/Notes alongside Vesperglass Codex Metadata Dossier (300px usable inner width,
      GameDetailsPanePosition Left / Center / Stretch / Right via scripts/game-page-breakpoints.mjs).
    - Empty state: Astrolabe EmptyGameTemplate centered in ViewportHeight when Game is null (PART_ScrollViewHost explicitly Visible).
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
                            <StackPanel Margin="30,0,30,30">
${indent(hideWhenNoGame('StackPanel'), 32)}
${indent(bannerSpacer('x * 158 / 300', 20, 'DetailsBannerSpacer'), 32)}
                                <DockPanel Margin="0,10,0,16">
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
    Vesperglass: grid side panel (GridViewGameOverview, generated by art/gen-overviews.mjs).
    - Banner (GameBannerHeight=300) with GameBannerDarken + 50% floor, spacer x * 124 / 300 (floor 14).
    - CloseGameSideBarCommand: 28x28 plate with DangerBrush hover; inline sticky left of icon when GameBannerHeight < 120 or
      ShowBackgroundImageOnWindow=True (CanContentScroll=False + ContentVerticalOffset translation), corner 12,12 otherwise & on null Game.
    - Actions under title: Hero pointed-hexagonal PlayButton + RunningActionIndicator + equal 40x40 SecondaryButton More & Edit.
    - Codex Metadata Dossier (GridDetailsPaneWidth=300 usable width, proportional 2*:3* columns, GameDetailsPanePosition responsive).
    - Empty state: Astrolabe EmptyGameTemplate centered in ViewportHeight when Game is null.
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
                                <Setter Property="BorderThickness" Value="1,0,0,0" />
                                <Style.Triggers>
                                    <DataTrigger Binding="{Settings GridViewDetailsPosition}" Value="Left"><Setter Property="BorderThickness" Value="0,0,1,0" /></DataTrigger>
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
${indent(bannerSpacer('x * 124 / 300', 14, 'GridBannerSpacer'), 40)}
                                        <StackPanel Panel.ZIndex="2" Margin="0,10,0,16">
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
${indent(sidePanelCloseButton({ preset: 'plate', comment: '' }), 28)}
                        </Grid>
                    </Border>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;

writeOverviews(out, detailsXaml, gridXaml);
