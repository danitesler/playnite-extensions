// Generates Counterfoil DetailsViewGameOverview.xaml & GridViewGameOverview.xaml from shared overview helpers.
// Usage: node src/themes/Counterfoil/art/gen-overviews.mjs
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
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

// Custom 28x28 Counterfoil film-tab close button: dark smoked film plate with hairline rail rim,
// subtle left corner notch, and smooth DangerBrush crimson fade-in on hover.
const counterfoilCloseTemplate = `<ControlTemplate TargetType="{x:Type Button}">
    <Grid Background="Transparent" SnapsToDevicePixels="True">
        <Border x:Name="Plate" Background="{DynamicResource ButtonBackgroundBrush}"
                BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="1"
                CornerRadius="{DynamicResource ControlCornerRadius}">
            <Grid ClipToBounds="True">
                <Border x:Name="HoverPlate" Background="{DynamicResource DangerBrush}" Opacity="0" IsHitTestVisible="False" />
                <Rectangle Width="3" Height="6" HorizontalAlignment="Left" VerticalAlignment="Top" Margin="0,3,0,0"
                           Fill="{DynamicResource LocalFilmRailBrush}" Opacity="0.7" IsHitTestVisible="False" />
                <ContentControl x:Name="Glyph" Width="14" Height="14" HorizontalAlignment="Center" VerticalAlignment="Center"
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
  captionFontWeight: 'SemiBold',
  captionFontSize: 'FontSizeSmall',
  captionForeground: 'TextBrushDarker',
  captionVerticalAlignment: 'Top',
  captionStackMargin: '0,2,0,0',
  valueOptions: { chipsMargin: '0,0,0,-5', itemsWrapPanel: true },
};

// Divider break between metadata groups (Height="10" + Margin bottom 6 = 16px; group top Margin 10 = 26px total).
const groupBreak = `<Control Template="{DynamicResource DividerTemplate}" Focusable="False" IsTabStop="False" IsHitTestVisible="False"
         Margin="0,0,0,6" Foreground="{DynamicResource LocalFilmRailBrush}" />`;

// Disco Elysium Dialogue Transcript / Character Sheet Metadata Dossier:
// Flanked on BOTH left & right edges by metallic 35mm FELD film-strip ruler rails (film-rail.png),
// crowned by torn photo-paper DETAILS tape strip + four-skill INT/PSY/FYS/MOT micro-stripe bar.
function renderMetadataPane(widthKey) {
  const blocks = META_GROUPS.map(g => metadataGroup(g, 'stack', {
    margin: '0,10,0,0',
    padding: '0',
    borderThickness: '',
    borderBrush: '',
    beforeFields: groupBreak,
    fieldOptions,
  })).join('\n');

  return `<Border VerticalAlignment="Top" Background="{DynamicResource PopupBackgroundBrush}"
        BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="1">
    <Grid ClipToBounds="True">
        <!-- Subtle 35mm emulsion grain & bottom-right amber halftone corner -->
        <Rectangle Fill="{DynamicResource LocalFilmRailBrightBrush}" Opacity="0.045"
                   OpacityMask="{DynamicResource LocalFilmGrainMaskBrush}" IsHitTestVisible="False" />
        <Rectangle Width="180" Height="136" HorizontalAlignment="Right" VerticalAlignment="Bottom"
                   Fill="{DynamicResource LocalDarkroomAmberBrush}" Opacity="0.11"
                   OpacityMask="{DynamicResource LocalHalftoneCornerMaskBrush}" IsHitTestVisible="False" />

        <!-- Twin metallic 35mm FELD film-strip rails flanking left and right edges -->
        <Control Width="12" HorizontalAlignment="Left" Template="{DynamicResource LocalFilmRailTemplate}"
                 Foreground="{DynamicResource LocalFilmRailBrush}" Opacity="0.62"
                 Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
        <Control Width="12" HorizontalAlignment="Right" Template="{DynamicResource LocalFilmRailTemplate}"
                 Foreground="{DynamicResource LocalFilmRailBrush}" Opacity="0.62"
                 Focusable="False" IsTabStop="False" IsHitTestVisible="False"
                 RenderTransformOrigin="0.5,0.5">
            <Control.RenderTransform>
                <ScaleTransform ScaleX="-1" />
            </Control.RenderTransform>
        </Control>

        <DockPanel Margin="12,0,12,0">
            <!-- Torn photo-paper masthead + INT/PSY/FYS/MOT 4-skill micro-stripe rule -->
            <StackPanel DockPanel.Dock="Top" Margin="14,14,14,4">
                <DockPanel>
                    <Grid DockPanel.Dock="Left" VerticalAlignment="Center">
                        <Control Template="{DynamicResource LocalTapeTabTemplate}"
                                 Background="{DynamicResource SelectedBrush}"
                                 Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
                        <TextBlock Text="{DynamicResource LOCGameDetails}"
                                   FontFamily="{DynamicResource HeadingFontFamily}"
                                   FontSize="{DynamicResource FontSizeLarge}" FontWeight="Bold"
                                   Foreground="{DynamicResource SelectedForegroundBrush}"
                                   Padding="11,3,14,4" VerticalAlignment="Center" />
                    </Grid>
                    <Rectangle Height="1" Margin="8,0,0,0" VerticalAlignment="Center"
                               Fill="{DynamicResource NormalBorderBrush}" IsHitTestVisible="False" />
                </DockPanel>
                <Control Margin="0,8,0,0" Template="{DynamicResource LocalAttributeBarTemplate}"
                         Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
            </StackPanel>

            <Border Padding="14,8,14,16">
                <StackPanel Width="{DynamicResource ${widthKey}}">
                    <Grid ClipToBounds="True">
                        <StackPanel Margin="0,-26,0,-4">
${indent(blocks, 28)}
                        </StackPanel>
                    </Grid>
                </StackPanel>
            </Border>
        </DockPanel>
    </Grid>
</Border>`;
}

// Disco Elysium torn photo-paper section header (like SETTINGS, INVENTORY, PERCEPTION) + trailing film hairline
const sectionHeading = (loc) => `<DockPanel Margin="0,0,0,12">
    <Grid DockPanel.Dock="Left" VerticalAlignment="Center" Margin="0,0,10,0">
        <Control Template="{DynamicResource LocalTapeTabTemplate}"
                 Background="{DynamicResource SelectedBrush}"
                 Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
        <TextBlock Text="{DynamicResource ${loc}}"
                   FontFamily="{DynamicResource HeadingFontFamily}"
                   FontSize="{DynamicResource FontSizeLarge}" FontWeight="Bold"
                   Foreground="{DynamicResource SelectedForegroundBrush}"
                   Padding="11,3,15,4" VerticalAlignment="Center" />
    </Grid>
    <Control Template="{DynamicResource DividerTemplate}" Foreground="{DynamicResource LocalFilmRailBrush}"
             VerticalAlignment="Center" Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
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
                 Foreground="{DynamicResource NormalBorderBrush}" Focusable="False" IsTabStop="False">
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
                      Tag="{DynamicResource LinkBrush}"
                      HtmlForeground="{Binding Path=(TextElement.Foreground).Color, RelativeSource={RelativeSource Self}}"
                      LinkForeground="{Binding Tag.Color, RelativeSource={RelativeSource Self}}"
                      TextElement.Foreground="{DynamicResource TextBrush}" />
    </StackPanel>
    <StackPanel x:Name="PART_ElemNotes" Margin="0,20,0,0">
${indent(sectionHeading('LOCNotesLabel'), 8)}
        <TextBox x:Name="PART_TextNotes" IsReadOnly="True" TextWrapping="Wrap" Style="{DynamicResource LocalNotesTextBox}" />
    </StackPanel>
</StackPanel>`;

// Hero banner with painterly dissolve + iconic FELD horizontal film-splice tape along the lower edge
const heroBanner = `<Grid x:Name="HeroArt" VerticalAlignment="Top" IsHitTestVisible="False">
${indent(heroVisibilityStyle(), 4)}
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill" />
${indent(bannerDarkeningFloor(), 4)}
    <!-- Soft film-emulsion dissolve into PageRoot.Background -->
    <Rectangle Opacity="0.38">
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                <GradientStop Color="#00000000" Offset="0.15" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="0.72" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
    <Rectangle>
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                <GradientStop Color="#00000000" Offset="0.54" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="0.95" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
    <!-- FELD 35mm horizontal film-strip splice tape closing the banner edge -->
    <Grid Height="11" VerticalAlignment="Bottom" Opacity="0.72">
        <Control Template="{DynamicResource LocalFilmRailHTemplate}"
                 Foreground="{DynamicResource LocalFilmRailBrush}" Focusable="False" IsTabStop="False" />
        <Rectangle Height="1" VerticalAlignment="Top" Fill="{DynamicResource SelectedBrush}" Opacity="0.55" />
    </Grid>
</Grid>`;

const actionsRow = `<Grid MinWidth="188" Height="42">
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

const titleStack = `<TextBlock x:Name="PART_TextDisplayName" VerticalAlignment="Center"
           FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLargest}"
           FontWeight="Bold" TextWrapping="Wrap"
           Foreground="{DynamicResource HeadingForegroundBrush}" />`;

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
  return `<Grid Margin="0,14,0,0">
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="*" />
        <ColumnDefinition Width="Auto" />
    </Grid.ColumnDefinitions>
${indent(mainContent, 4)}
    <Grid Grid.Column="1" Margin="24,0,0,0" VerticalAlignment="Top">
${indent(renderMetadataPane(widthKey), 8)}
    </Grid>
</Grid>`;
}

const detailsXaml = `<!--
    Counterfoil: Views/DetailsViewGameOverview.xaml (generated by art/gen-overviews.mjs).
    - Exposed-film hero banner (GameBannerHeight=260, spacer x * 204 / 260 floor 20) closed by a FELD horizontal film-strip splice.
    - Header: Contact-sheet framed icon + Barlow Condensed Bold title + Vermilion/Psyche painterly PlayButton + RunningActionIndicator + More & Edit.
    - Body: Torn photo-paper section headers (SCREENSHOTS / DESCRIPTION / NOTES) alongside twin-rail FELD Transcript Metadata
      (GameDetailsPaneWidth=300 usable width, GameDetailsPanePosition Left / Center / Stretch / Right via scripts/game-page-breakpoints.mjs).
    - Empty state: Blank FELD film frame EmptyGameTemplate centered in ViewportHeight (PART_ScrollViewHost Visible).
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
                            <Control Style="{DynamicResource LocalFilmBackdropOverlay}" />
                            <StackPanel Margin="30,0,30,30">
${indent(hideWhenNoGame('StackPanel'), 32)}
${indent(bannerSpacer('x * 204 / 260', 20, 'DetailsBannerSpacer'), 32)}
                                <DockPanel Margin="0,10,0,14">
                                    <StackPanel Orientation="Horizontal" DockPanel.Dock="Right" VerticalAlignment="Center" Margin="18,0,0,0">
${indent(actionsRow, 40)}
                                    </StackPanel>
                                    <DockPanel>
                                        <Image x:Name="PART_ImageIcon" MaxWidth="46" MaxHeight="46" Margin="0,0,14,0" DockPanel.Dock="Left" VerticalAlignment="Center" />
${indent(titleStack, 40)}
                                    </DockPanel>
                                </DockPanel>
                                <Rectangle Height="1" Margin="0,0,0,4" Fill="{DynamicResource PanelSeparatorBrush}" Opacity="0.75" IsHitTestVisible="False" />
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
    Counterfoil: Views/GridViewGameOverview.xaml (generated by art/gen-overviews.mjs).
    - Exposed-film hero banner (GameBannerHeight=260, spacer x * 190 / 260 floor 14) closed by a FELD film-strip splice.
    - CloseGameSideBarCommand: custom 28x28 Counterfoil film-tab plate with DangerBrush crimson hover;
      inline sticky left of icon when GameBannerHeight < 120 or ShowBackgroundImageOnWindow=True, corner 12,12 otherwise.
    - Twin-rail FELD Transcript Metadata (GridDetailsPaneWidth=300 usable width, 2*:3* columns, GameDetailsPanePosition).
    - Empty state: Blank FELD film frame EmptyGameTemplate centered in ViewportHeight when Game is null.
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
                                    <Control Style="{DynamicResource LocalFilmBackdropOverlay}" />
                                    <StackPanel Panel.ZIndex="2" Margin="24,0,24,26">
${indent(hideWhenNoGame('StackPanel'), 40)}
${indent(bannerSpacer('x * 190 / 260', 14, 'GridBannerSpacer'), 40)}
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
                                        <Rectangle Height="1" Margin="0,0,0,4" Fill="{DynamicResource PanelSeparatorBrush}" Opacity="0.75" IsHitTestVisible="False" />
${indent(renderTwoColumnBody('GridDetailsPaneWidth'), 40)}
                                    </StackPanel>
${indent(emptyState, 36)}
                                </Grid>
                            </ScrollViewer>
${indent(sidePanelCloseButton({ template: counterfoilCloseTemplate, comment: '' }), 28)}
                        </Grid>
                    </Border>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;

writeOverviews(out, detailsXaml, gridXaml);

// Automatically apply responsive metadata breakpoints & GameDetailsPanePosition (Left / Center / Stretch / Right)
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
execFileSync(
  process.execPath,
  [
    path.join(repoRoot, 'scripts/game-page-breakpoints.mjs'),
    path.join(out, 'Views/DetailsViewGameOverview.xaml'),
    path.join(out, 'Views/GridViewGameOverview.xaml'),
  ],
  { cwd: repoRoot, stdio: 'inherit' },
);
