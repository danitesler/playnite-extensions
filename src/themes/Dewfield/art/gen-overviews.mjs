/**
 * Dewfield overview generator (DetailsViewGameOverview.xaml & GridViewGameOverview.xaml).
 * Emits Dewfield's Stardew Valley-inspired Farmstead Wooden Ledger game page:
 * - Carved wooden picture-frame hero banner (mahogany & cedar bevel rim + 4 sun-amber corner pegs +
 *   GameBannerDarken & 50% floor + warm honey-parchment bottom scrim), proportional MathConverter
 *   spacer with minimum top gutter at low/zero banner heights.
 * - Header: Pixelify Sans display title (flips to WindowArtForegroundBrush over window art),
 *   Harvest Meadow-Green PlayButton + Starwater RunningActionIndicator + 40x40 wooden bevel SecondaryButton More & Edit.
 * - Metadata pane: Honey-parchment Farmstead Ledger (#FFD284) framed in 3-step carved cedar wood bevel,
 *   crowned by a rolled cream parchment scroll bar ornament, 300px usable inner width,
 *   GameDetailsPanePosition Left / Center / Stretch / Right via scripts/game-page-breakpoints.mjs.
 * - Empty state: Sprout-Star Wooden Signpost EmptyGameTemplate centered in ViewportHeight when Game is null.
 * - Grid side panel: custom 28x28 Stardew Red-X cream-and-wood SidePanelCloseButton (inline sticky at
 *   GameBannerHeight < 120 or ShowBackgroundImageOnWindow=True; top-left corner at >= 120 and when Game is null).
 *
 * Usage:
 *   node src/themes/Dewfield/art/gen-overviews.mjs [src/themes/Dewfield/src]
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

// Custom 28x28 Stardew Red-X Close Plaque (cream parchment + mahogany border + bevels; solid Crimson hover)
const dewfieldCloseTemplate = `<ControlTemplate TargetType="{x:Type Button}">
    <Grid Background="Transparent" SnapsToDevicePixels="True">
        <Border x:Name="Plate" Background="{DynamicResource ButtonBackgroundBrush}"
                BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="2"
                CornerRadius="{DynamicResource CornerRadiusSmall}" IsHitTestVisible="False">
            <Grid>
                <Border BorderBrush="{DynamicResource LocalCreamHiBrush}" BorderThickness="1.5,1.5,0,0" />
                <Border BorderBrush="{DynamicResource NormalBrushDark}" BorderThickness="0,0,1.5,1.5" />
            </Grid>
        </Border>
        <Border x:Name="HoverPlate" Background="{DynamicResource DangerBrush}"
                BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="2"
                CornerRadius="{DynamicResource CornerRadiusSmall}"
                Opacity="0" IsHitTestVisible="False">
            <Border BorderBrush="{DynamicResource LocalCrimsonHiBrush}" BorderThickness="1.5,1.5,0,0" />
        </Border>
        <ContentControl x:Name="Glyph" Width="14" Height="14" HorizontalAlignment="Center" VerticalAlignment="Center"
                        IsHitTestVisible="False" Content="{DynamicResource IconWindowClose}" ContentTemplate="{DynamicResource IconTemplate}"
                        Foreground="{DynamicResource LocalCrimsonHiBrush}" />
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
                    <DoubleAnimation Storyboard.TargetName="HoverPlate" Storyboard.TargetProperty="Opacity" To="0" Duration="0:0:0.15" />
                </Storyboard></BeginStoryboard>
            </Trigger.ExitActions>
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

    const rows = fields.map(([name, loc, kind, part]) => `<Border x:Name="PART_Elem${name}">
    <Grid>
        <Grid.ColumnDefinitions>${colDefs}</Grid.ColumnDefinitions>
        <TextBlock Grid.Column="0" Text="{DynamicResource ${loc}}" FontSize="{DynamicResource FontSizeSmall}" FontWeight="SemiBold" Foreground="{DynamicResource TextBrushDarker}" TextWrapping="Wrap" Margin="0,2,0,0" />
        <Border Grid.Column="2">${metadataValue(kind, part)}</Border>
    </Grid>
</Border>`).join('\n');

    return `<Border x:Name="${groupName}" Margin="0,10,0,0" Padding="0,10,0,0" BorderThickness="0,1.5,0,0" BorderBrush="{DynamicResource PanelSeparatorBrush}">
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

  return `<!-- Dewfield Farmstead Wooden Ledger (3-step cedar wood bevel + rolled scroll crown, 300px usable inner width) -->
<Grid VerticalAlignment="Top" HorizontalAlignment="Stretch" Margin="0,8,0,0" SnapsToDevicePixels="True">
    <Border Background="{DynamicResource NormalBrush}"
            BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="2"
            CornerRadius="{DynamicResource CornerRadiusLarge}">
        <Grid>
            <Control Template="{DynamicResource LocalParchmentGrainTemplate}" Foreground="{DynamicResource LocalCedarShadowBrush}"
                     Opacity="0.045" Focusable="False" IsHitTestVisible="False" />
            <!-- 3-step carved cedar inner rim -->
            <Border BorderBrush="{DynamicResource LocalCedarBrush}" BorderThickness="2" IsHitTestVisible="False">
                <Grid>
                    <Border BorderBrush="{DynamicResource LocalCedarHiBrush}" BorderThickness="1.5,1.5,0,0" />
                    <Border BorderBrush="{DynamicResource LocalCedarShadowBrush}" BorderThickness="0,0,1.5,1.5" />
                </Grid>
            </Border>
            <Border Padding="16,18,16,14">
                <StackPanel Width="{DynamicResource ${widthKey}}">
                    <Control Template="{DynamicResource LocalSkillPipDividerTemplate}" Margin="0,0,0,10" Focusable="False" />
                    <Grid ClipToBounds="True">
                        <StackPanel Margin="0,-29,0,-7">
${indent(blocks, 28)}
                        </StackPanel>
                    </Grid>
                </StackPanel>
            </Border>
        </Grid>
    </Border>
    <!-- Rolled Cream Parchment Scroll Ornament perched on top center of the wooden ledger -->
    <Grid Height="14" Width="116" HorizontalAlignment="Center" VerticalAlignment="Top" Margin="0,-7,0,0" IsHitTestVisible="False">
        <Border Margin="5,0,5,0" Background="{DynamicResource LocalCreamBrush}"
                BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="2" CornerRadius="2">
            <Grid>
                <Border BorderBrush="{DynamicResource LocalCreamHiBrush}" BorderThickness="0,1.5,0,0" />
                <StackPanel Orientation="Horizontal" HorizontalAlignment="Center" VerticalAlignment="Center">
                    <Path Width="6" Height="6" Margin="0,0,5,0" Stretch="Fill" Data="M 3,0 L 6,3 L 3,6 L 0,3 Z" Fill="{DynamicResource LocalCedarBrush}" />
                    <Rectangle Width="36" Height="2" VerticalAlignment="Center" Fill="{DynamicResource LocalCedarHiBrush}" />
                    <Path Width="6" Height="6" Margin="5,0,0,0" Stretch="Fill" Data="M 3,0 L 6,3 L 3,6 L 0,3 Z" Fill="{DynamicResource LocalCedarBrush}" />
                </StackPanel>
            </Grid>
        </Border>
        <Border Width="8" HorizontalAlignment="Left" Background="{DynamicResource NormalBrushDark}"
                BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="2" CornerRadius="2" />
        <Border Width="8" HorizontalAlignment="Right" Background="{DynamicResource NormalBrushDark}"
                BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="2" CornerRadius="2" />
    </Grid>
</Grid>`;
}

const sectionHeading = (loc) => `<DockPanel Margin="0,0,0,10">
    <Path DockPanel.Dock="Left" Width="9" Height="9" Margin="0,0,8,0" VerticalAlignment="Center" Stretch="Fill"
          Data="M 4.5,0 L 9,4.5 L 4.5,9 L 0,4.5 Z" Fill="{DynamicResource LocalCedarHiBrush}"
          Stroke="{DynamicResource NormalBorderBrush}" StrokeThickness="1.2" IsHitTestVisible="False" />
    <TextBlock DockPanel.Dock="Left" Text="{DynamicResource ${loc}}" Style="{DynamicResource HeadingTextBlock}" Margin="0,0,10,0" />
    <Control Template="{DynamicResource LocalSkillPipDividerTemplate}" VerticalAlignment="Center" Focusable="False" />
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
                 Focusable="False">
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
        <Border Padding="14,12" BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="2"
                CornerRadius="{DynamicResource ControlCornerRadius}">
            <Border.Style>
                <Style TargetType="Border">
                    <Setter Property="Background" Value="{DynamicResource LocalCreamBrush}" />
                    <Style.Triggers>
                        <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                            <Setter Property="Background" Value="Transparent" />
                            <Setter Property="BorderThickness" Value="0" />
                            <Setter Property="Padding" Value="0" />
                        </DataTrigger>
                    </Style.Triggers>
                </Style>
            </Border.Style>
            <HtmlTextView x:Name="PART_HtmlDescription" HtmlFontFamily="{DynamicResource FontFamily}" HtmlFontSize="{DynamicResource FontSize}"
                          Tag="{DynamicResource LinkBrush}"
                          HtmlForeground="{Binding Path=(TextElement.Foreground).Color, RelativeSource={RelativeSource Self}}"
                          LinkForeground="{Binding Tag.Color, RelativeSource={RelativeSource Self}}">
                <HtmlTextView.Style>
                    <Style TargetType="HtmlTextView">
                        <Setter Property="TextElement.Foreground" Value="{DynamicResource TextBrush}" />
                        <Style.Triggers>
                            <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                                <Setter Property="TextElement.Foreground" Value="{DynamicResource WindowArtForegroundBrush}" />
                            </DataTrigger>
                        </Style.Triggers>
                    </Style>
                </HtmlTextView.Style>
            </HtmlTextView>
        </Border>
    </StackPanel>
    <StackPanel x:Name="PART_ElemNotes" Margin="0,20,0,0">
${indent(sectionHeading('LOCNotesLabel'), 8)}
        <TextBox x:Name="PART_TextNotes" IsReadOnly="True" TextWrapping="Wrap"
                 Background="{DynamicResource LocalCreamBrush}" BorderBrush="{DynamicResource NormalBorderBrush}"
                 BorderThickness="2" Padding="12,10" />
    </StackPanel>
</StackPanel>`;

const heroBanner = `<Grid x:Name="HeroArt" VerticalAlignment="Top" IsHitTestVisible="False">
${indent(heroVisibilityStyle(), 4)}
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill" />
${indent(bannerDarkeningFloor(), 4)}
    <!-- Carved Wooden Picture-Frame Trim + 4 Sun-Amber Corner Pegs -->
    <Border Margin="24,10,24,0" BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="3,3,3,0"
            CornerRadius="4,4,0,0" Opacity="0.92">
        <Border BorderBrush="{DynamicResource LocalCedarBrush}" BorderThickness="2,2,2,0" />
    </Border>
    <Border Width="7" Height="7" Margin="30,16,0,0" HorizontalAlignment="Left" VerticalAlignment="Top"
            Background="{DynamicResource LocalAmberBrush}" BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="1.5" />
    <Border Width="7" Height="7" Margin="0,16,30,0" HorizontalAlignment="Right" VerticalAlignment="Top"
            Background="{DynamicResource LocalAmberBrush}" BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="1.5" />
    <!-- Warm Honey-Parchment bottom fade so Pixelify Sans title & Play button stay crisp -->
    <Rectangle>
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                <GradientStop Color="#00000000" Offset="0.28" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="0.78" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
</Grid>`;

const actionsRow = `<Grid MinWidth="166" Height="42">
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
    <TextBlock x:Name="PART_TextDisplayName" FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLargest}"
               TextWrapping="Wrap">
        <TextBlock.Style>
            <Style TargetType="TextBlock" BasedOn="{StaticResource BaseTextBlockStyle}">
                <Setter Property="Foreground" Value="{DynamicResource HeadingForegroundBrush}" />
                <Style.Triggers>
                    <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                        <Setter Property="Foreground" Value="{DynamicResource WindowArtForegroundBrush}" />
                    </DataTrigger>
                </Style.Triggers>
            </Style>
        </TextBlock.Style>
    </TextBlock>
    <Border Height="2" Margin="0,4,0,0" Background="{DynamicResource LocalCedarHiBrush}">
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
    <Control Template="{DynamicResource EmptyGameTemplate}" Focusable="False" />
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
    Dewfield: Views/DetailsViewGameOverview.xaml (generated by art/gen-overviews.mjs).
    - Carved wooden picture-frame hero banner (GameBannerHeight=320, spacer x * 246 / 320 floor 20) with GameBannerDarken + 50% floor.
    - Header: Game icon + Pixelify Sans title (flips to WindowArtForegroundBrush over window art) + Meadow-Green PlayButton +
      Starwater RunningActionIndicator + equal 40x40 wooden bevel SecondaryButton More & Edit.
    - Body: SteamScreenshotsGameScope + Description/Notes alongside Farmstead Wooden Ledger Metadata (300px usable width,
      GameDetailsPanePosition Left / Center / Stretch / Right via scripts/game-page-breakpoints.mjs).
    - Empty state: Sprout-Star Wooden Signpost EmptyGameTemplate centered in ViewportHeight (PART_ScrollViewHost Visible).
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
${indent(bannerSpacer('x * 246 / 320', 20, 'DetailsBannerSpacer'), 32)}
                                <DockPanel Margin="0,10,0,16">
                                    <StackPanel Orientation="Horizontal" DockPanel.Dock="Right" VerticalAlignment="Center" Margin="18,0,0,0">
${indent(actionsRow, 40)}
                                    </StackPanel>
                                    <DockPanel>
                                        <Image x:Name="PART_ImageIcon" MaxWidth="48" MaxHeight="48" Margin="0,0,14,0" DockPanel.Dock="Left" VerticalAlignment="Center" />
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
    Dewfield: Views/GridViewGameOverview.xaml (generated by art/gen-overviews.mjs).
    - Carved wooden picture-frame hero banner (GameBannerHeight=320, spacer x * 224 / 320 floor 14) with GameBannerDarken + 50% floor.
    - CloseGameSideBarCommand: custom 28x28 Stardew Red-X cream-and-wood plaque with solid Crimson hover;
      inline sticky left of icon when GameBannerHeight < 120 or ShowBackgroundImageOnWindow=True, corner 12,12 otherwise.
    - Actions under title: PlayButton + RunningActionIndicator + equal 40x40 wooden bevel SecondaryButton More & Edit.
    - Farmstead Wooden Ledger Metadata (GridDetailsPaneWidth=300 usable width, 2*:3* columns, GameDetailsPanePosition).
    - Empty state: Sprout-Star Wooden Signpost EmptyGameTemplate centered in ViewportHeight when Game is null.
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
${indent(heroBanner, 36)}
                                    <StackPanel Panel.ZIndex="2" Margin="24,0,24,26">
${indent(hideWhenNoGame('StackPanel'), 40)}
${indent(bannerSpacer('x * 224 / 320', 14, 'GridBannerSpacer'), 40)}
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
${indent(sidePanelCloseButton({ template: dewfieldCloseTemplate, comment: '' }), 28)}
                        </Grid>
                    </Border>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;

writeOverviews(out, detailsXaml, gridXaml);
