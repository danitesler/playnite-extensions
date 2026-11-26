// Umbralune: generates Views/DetailsViewGameOverview.xaml and Views/GridViewGameOverview.xaml
// and applies responsive breakpoints + GameDetailsPanePosition (Right / Left / Center / Stretch).
import {
  metaGroups,
  metadataGroup,
  hideWhenNoGame,
  heroVisibilityStyle,
  bannerDarkeningFloor,
  bannerSpacer,
  steamScreenshotsGate,
  inlineCloseButton,
  sidePanelCloseButton,
  pageRootStyle,
  resolveThemeSrcDir,
  writeOverviews,
  indent,
} from '../../../../scripts/overview-generator.mjs';

const GROUP_LABELS = {
  MetaProgress: 'PLAY RECORD',
  MetaScores: 'SCORES',
  MetaAbout: 'CHRONICLE',
  MetaTags: 'ATTRIBUTES',
  MetaLibrary: 'LIBRARY',
  MetaLinks: 'LINKS',
};

function ribbonBreak(label) {
  return `<Grid Height="22" Margin="0,0,0,7" IsHitTestVisible="False">
    <Border Background="{DynamicResource HeaderBandBrush}" BorderBrush="{DynamicResource FrameBrush}" BorderThickness="0,1">
        <Border.OpacityMask>
            <LinearGradientBrush StartPoint="0,0" EndPoint="1,0">
                <GradientStop Color="#00000000" Offset="0" />
                <GradientStop Color="#FF000000" Offset="0.16" />
                <GradientStop Color="#FF000000" Offset="0.84" />
                <GradientStop Color="#00000000" Offset="1" />
            </LinearGradientBrush>
        </Border.OpacityMask>
    </Border>
    <Control Template="{DynamicResource LocalRuneBandTemplate}" Foreground="{DynamicResource LaunchingIndicatorBrush}" Opacity="0.34" />
    <StackPanel Orientation="Horizontal" HorizontalAlignment="Center" VerticalAlignment="Center">
        <Polygon Width="5" Height="5" VerticalAlignment="Center" Margin="0,0,7,0" Points="2.5,0 5,2.5 2.5,5 0,2.5" Fill="{DynamicResource GiltDimBrush}" />
        <TextBlock Text="${label}" FontFamily="{DynamicResource HeadingFontFamily}" FontSize="12.5" FontWeight="Bold"
                   Foreground="{DynamicResource HeaderBandForegroundBrush}" VerticalAlignment="Center" />
        <Polygon Width="5" Height="5" VerticalAlignment="Center" Margin="7,0,0,0" Points="2.5,0 5,2.5 2.5,5 0,2.5" Fill="{DynamicResource GiltDimBrush}" />
    </StackPanel>
</Grid>`;
}

const CLOSE_BUTTON_TEMPLATE = `<ControlTemplate TargetType="{x:Type Button}">
    <Grid Background="Transparent" SnapsToDevicePixels="True">
        <Border CornerRadius="{DynamicResource ControlCornerRadius}"
                Background="{DynamicResource ButtonBackgroundBrush}"
                BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="1" IsHitTestVisible="False" />
        <Border x:Name="HoverPlate" CornerRadius="{DynamicResource ControlCornerRadius}"
                Background="{DynamicResource DangerBrush}" BorderBrush="{DynamicResource DangerForegroundBrush}" BorderThickness="1"
                Opacity="0" IsHitTestVisible="False" />
        <Polygon Width="4" Height="4" HorizontalAlignment="Left" VerticalAlignment="Top" Margin="2"
                 Points="2,0 4,2 2,4 0,2" Fill="{DynamicResource GiltDimBrush}" IsHitTestVisible="False" />
        <Polygon Width="4" Height="4" HorizontalAlignment="Right" VerticalAlignment="Bottom" Margin="2"
                 Points="2,0 4,2 2,4 0,2" Fill="{DynamicResource GiltDimBrush}" IsHitTestVisible="False" />
        <ContentControl x:Name="Glyph" Width="14" Height="14" HorizontalAlignment="Center" VerticalAlignment="Center" IsHitTestVisible="False"
                        Content="{DynamicResource IconWindowClose}" ContentTemplate="{DynamicResource IconTemplate}"
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
                    <DoubleAnimation FillBehavior="Stop" Storyboard.TargetName="HoverPlate" Storyboard.TargetProperty="Opacity" To="0" Duration="0:0:0.16" />
                </Storyboard></BeginStoryboard>
            </Trigger.ExitActions>
        </Trigger>
        <Trigger Property="IsPressed" Value="True">
            <Setter TargetName="HoverPlate" Property="Opacity" Value="0.72" />
        </Trigger>
    </ControlTemplate.Triggers>
</ControlTemplate>`;

function buildOverview(kind) {
  const isGrid = kind === 'Grid';
  const targetType = isGrid ? 'GridViewGameOverview' : 'DetailsViewGameOverview';
  const paneWidthKey = isGrid ? 'GridDetailsPaneWidth' : 'GameDetailsPaneWidth';
  const groups = metaGroups();

  const metaBlocks = groups.map((g, idx) =>
    metadataGroup(g, 'side', {
      margin: idx === 0 ? '0,2,0,0' : '0,8,0,0',
      padding: '0',
      borderThickness: '',
      borderBrush: '',
      beforeFields: ribbonBreak(GROUP_LABELS[g[0]] || 'DETAILS'),
      fieldOptions: {
        wrapper: 'Grid',
        margin: '0,5',
        sideColumnWidth: '110',
        sideValueWrapper: false,
        captionFontSize: 'FontSize',
        captionForeground: 'TextBrushDarker',
        captionSideMargin: '0,1,10,0',
      },
    })
  ).join('\n');

  const inlineClose = isGrid ? `\n${indent(inlineCloseButton(), 36)}` : '';
  const cornerClose = isGrid
    ? `\n${indent(sidePanelCloseButton({ template: CLOSE_BUTTON_TEMPLATE }), 24)}`
    : '';

  return `<!--
    Umbralune: Views/${targetType}.xaml (generated by art/build-overviews.mjs).
    Nocturnal Umbran Sapphire game page:
    - Full-bleed hero art melting across a cyan-flared Umbran Horizon seam (LocalFlareBeamTemplate) with GameBannerDarken + 50% floor.
    - Hero Solar Halo Gold Play CTA + RunningActionIndicator + equal square icon-only More & Edit buttons.
    - Chapter V Midnight-Sapphire & Gold Filigree Tarot Metadata Dossier (300px usable width, vertical gold filigree lace,
      4 corner studs, violet-amethyst HARD rune ribbons collapsing cleanly in Center/Stretch).
    - Designed Umbran Watch EmptyGameTemplate with PART_ScrollViewHost explicitly Visibility="Visible".
-->
<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
                    xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
                    xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
                    mc:Ignorable="d">

    <Style TargetType="{x:Type ${targetType}}">
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="{x:Type ${targetType}}">
                    <Grid x:Name="PageRoot" SnapsToDevicePixels="True"
                          d:DesignWidth="1050" d:DesignHeight="820"
                          d:DataContext="{x:Static DesignMainViewModel.DesignSelectedGameIntance}">
${indent(pageRootStyle('GameOverviewBackgroundBrush', 'Grid'), 24)}

                        <!-- Ambient astral nebula + centered Umbran Watch watermark (collapsed under window art) -->
                        <Grid x:Name="PageAtmosphere" ClipToBounds="True" IsHitTestVisible="False">
                            <Grid.Style>
                                <Style TargetType="Grid">
                                    <Style.Triggers>
                                        <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                                            <Setter Property="Visibility" Value="Collapsed" />
                                        </DataTrigger>
                                    </Style.Triggers>
                                </Style>
                            </Grid.Style>
                            <Control Template="{DynamicResource LocalNebulaTemplate}"
                                     Foreground="{DynamicResource ButtonPressedBackgroundBrush}" Opacity="0.14" />
                            <Control Width="460" Height="460" HorizontalAlignment="Center" VerticalAlignment="Center"
                                     Template="{DynamicResource LocalWatchWatermarkTemplate}"
                                     Foreground="{DynamicResource GlyphBrush}" Opacity="0.065" />
                        </Grid>

                        <ScrollViewer x:Name="PART_ScrollViewHost" Visibility="Visible"
                                      CanContentScroll="False"
                                      HorizontalScrollBarVisibility="Disabled" VerticalScrollBarVisibility="Auto">
                            <Grid>
                                <!-- Hero Art Layer -->
                                <Grid x:Name="HeroArt" VerticalAlignment="Top" ClipToBounds="True">
${indent(heroVisibilityStyle({ mode: 'height', includeNullGame: true }), 36)}
                                    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill"
                                               HorizontalAlignment="Center" VerticalAlignment="Center" />
${indent(bannerDarkeningFloor(), 36)}
                                    <!-- Seamless Midnight Sapphire bottom fade -->
                                    <Rectangle IsHitTestVisible="False">
                                        <Rectangle.Fill>
                                            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                                                <GradientStop Color="#1406112A" Offset="0" />
                                                <GradientStop Color="#6606112A" Offset="0.55" />
                                                <GradientStop Color="#FF06112A" Offset="1" />
                                            </LinearGradientBrush>
                                        </Rectangle.Fill>
                                    </Rectangle>
                                </Grid>

                                <!-- Selected Game Content Stack -->
                                <StackPanel x:Name="GameContent" Panel.ZIndex="2" Margin="24,0,24,28">
${indent(hideWhenNoGame('StackPanel'), 36)}
${indent(bannerSpacer('x * 168 / 320', 20, isGrid ? 'GridBannerSpacer' : 'BannerSpacer'), 36)}

                                    <!-- Header Band (Panel.ZIndex=2 on StackPanel & DockPanel keeps inline close button clickable while scrolling) -->
                                    <StackPanel x:Name="HeaderBlock" Panel.ZIndex="2" Margin="0,0,0,18">
                                        <DockPanel Panel.ZIndex="2" Margin="0,0,0,14">${inlineClose}
                                            <Image x:Name="PART_ImageIcon" DockPanel.Dock="Left"
                                                   MaxWidth="44" MaxHeight="44" Margin="0,0,14,0"
                                                   VerticalAlignment="Center"
                                                   RenderOptions.BitmapScalingMode="Fant" Stretch="Uniform" />

                                            <TextBlock x:Name="PART_TextDisplayName" VerticalAlignment="Center"
                                                       FontFamily="{DynamicResource HeadingFontFamily}"
                                                       FontSize="{DynamicResource FontSizeLargest}"
                                                       FontWeight="Bold"
                                                       Foreground="{DynamicResource TextBrush}"
                                                       TextWrapping="Wrap" />
                                        </DockPanel>

                                        <!-- Hero Action Bar: Solar Halo Play + RunningActionIndicator + More & Edit squares -->
                                        <StackPanel Orientation="Horizontal" VerticalAlignment="Center">
                                            <Grid Margin="0,0,10,0">
                                                <Button x:Name="PART_ButtonPlayAction" Style="{DynamicResource PlayButton}" />
                                                <Button x:Name="PART_ButtonContextAction" Style="{DynamicResource PlayButton}" Tag="ContextAction" />
                                                <Control Style="{DynamicResource RunningActionIndicator}" />
                                            </Grid>
                                            <Button x:Name="PART_ButtonMoreActions" Style="{DynamicResource SecondaryButton}"
                                                    Width="38" Height="38" MinWidth="38" MinHeight="38" Margin="0,0,8,0"
                                                    ToolTip="{DynamicResource LOCMoreAction}">
                                                <ContentControl Content="{DynamicResource IconOptions}" ContentTemplate="{DynamicResource IconTemplate}"
                                                                Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
                                            </Button>
                                            <Button x:Name="PART_ButtonEditGame" Style="{DynamicResource SecondaryButton}"
                                                    Width="38" Height="38" MinWidth="38" MinHeight="38"
                                                    ToolTip="{DynamicResource LOCEditGame}">
                                                <ContentControl Content="{DynamicResource IconEdit}" ContentTemplate="{DynamicResource IconTemplate}"
                                                                Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
                                            </Button>
                                        </StackPanel>
                                    </StackPanel>

                                    <!-- Cover art (shown only when Playnite's ShowCoverImage setting enables it) -->
                                    <Image x:Name="PART_ImageCover" MaxHeight="240" HorizontalAlignment="Left"
                                           Margin="0,0,0,16" RenderOptions.BitmapScalingMode="Fant" />

                                    <!-- Responsive Body: Main Column (Screenshots + Notes + Description) | Tarot Metadata Dossier -->
                                    <Grid x:Name="BodyGrid">
                                        <Grid.ColumnDefinitions>
                                            <ColumnDefinition Width="*" />
                                            <ColumnDefinition Width="24" />
                                            <ColumnDefinition Width="Auto" />
                                        </Grid.ColumnDefinitions>

                                        <!-- Main Content Column -->
                                        <StackPanel x:Name="MainColumn" Grid.Column="0">
${indent(steamScreenshotsGate({ mode: 'notify', margin: '0,0,0,18' }), 44)}

                                            <!-- Notes -->
                                            <StackPanel x:Name="PART_ElemNotes" Margin="0,0,0,20">
                                                <Grid Margin="0,0,0,10">
                                                    <Grid.ColumnDefinitions>
                                                        <ColumnDefinition Width="Auto" />
                                                        <ColumnDefinition Width="Auto" />
                                                        <ColumnDefinition Width="*" />
                                                    </Grid.ColumnDefinitions>
                                                    <Polygon Grid.Column="0" Width="7" Height="7" VerticalAlignment="Center" Margin="0,0,9,0"
                                                             Points="3.5,0 7,3.5 3.5,7 0,3.5" Fill="{DynamicResource GiltBrush}" />
                                                    <TextBlock Grid.Column="1" Text="{DynamicResource LOCNotesLabel}"
                                                               FontFamily="{DynamicResource HeadingFontFamily}"
                                                               FontSize="{DynamicResource FontSizeLarge}" FontWeight="Bold"
                                                               Foreground="{DynamicResource HighlightGlyphBrush}" VerticalAlignment="Center" />
                                                    <Control Grid.Column="2" Height="14" Margin="10,0,0,0" VerticalAlignment="Center"
                                                             Template="{DynamicResource LocalFlareBeamTemplate}"
                                                             Foreground="{DynamicResource BeamBrush}" Opacity="0.85" IsHitTestVisible="False" />
                                                </Grid>
                                                <TextBox x:Name="PART_TextNotes" IsReadOnly="True" TextWrapping="Wrap"
                                                         FontSize="{DynamicResource FontSizeLarge}"
                                                         Foreground="{DynamicResource TextBrush}"
                                                         BorderThickness="0" Background="Transparent" Padding="0" />
                                            </StackPanel>

                                            <!-- Description -->
                                            <StackPanel x:Name="PART_ElemDescription">
                                                <Grid Margin="0,0,0,10">
                                                    <Grid.ColumnDefinitions>
                                                        <ColumnDefinition Width="Auto" />
                                                        <ColumnDefinition Width="Auto" />
                                                        <ColumnDefinition Width="*" />
                                                    </Grid.ColumnDefinitions>
                                                    <Polygon Grid.Column="0" Width="7" Height="7" VerticalAlignment="Center" Margin="0,0,9,0"
                                                             Points="3.5,0 7,3.5 3.5,7 0,3.5" Fill="{DynamicResource GiltBrush}" />
                                                    <TextBlock Grid.Column="1" Text="{DynamicResource LOCGameDescriptionTitle}"
                                                               FontFamily="{DynamicResource HeadingFontFamily}"
                                                               FontSize="{DynamicResource FontSizeLarge}" FontWeight="Bold"
                                                               Foreground="{DynamicResource HighlightGlyphBrush}" VerticalAlignment="Center" />
                                                    <Control Grid.Column="2" Height="14" Margin="10,0,0,0" VerticalAlignment="Center"
                                                             Template="{DynamicResource LocalFlareBeamTemplate}"
                                                             Foreground="{DynamicResource BeamBrush}" Opacity="0.85" IsHitTestVisible="False" />
                                                </Grid>
                                                <HtmlTextView x:Name="PART_HtmlDescription"
                                                              HtmlFontFamily="{DynamicResource FontFamily}"
                                                              HtmlFontSize="{DynamicResource FontSizeLarge}"
                                                              TextElement.Foreground="{DynamicResource TextBrush}"
                                                              Tag="{DynamicResource LinkBrush}"
                                                              HtmlForeground="{Binding Path=(TextElement.Foreground).Color, RelativeSource={RelativeSource Self}}"
                                                              LinkForeground="{Binding Tag.Color, RelativeSource={RelativeSource Self}}" />
                                            </StackPanel>
                                        </StackPanel>

                                        <!-- HERO FOCAL PIECE 2: Chapter V Midnight-Sapphire & Gold Filigree Tarot Dossier -->
                                        <Border x:Name="MetaPane" Grid.Column="2" VerticalAlignment="Top"
                                                Background="{DynamicResource TopPanelBackgroundBrush}"
                                                BorderBrush="{DynamicResource GiltDimBrush}" BorderThickness="1"
                                                CornerRadius="{DynamicResource ControlCornerRadius}">
                                            <Grid>
                                                <!-- Inner hairline frame -->
                                                <Border Margin="4" BorderBrush="{DynamicResource WindowPanelSeparatorBrush}"
                                                        BorderThickness="1" CornerRadius="2" IsHitTestVisible="False" />
                                                <!-- Vertical antique-gold filigree lace strip on right margin -->
                                                <Control Width="12" HorizontalAlignment="Right" Margin="0,10,3,10"
                                                         Template="{DynamicResource LocalFiligreeLaceTemplate}"
                                                         Foreground="{DynamicResource GiltDimBrush}" Opacity="0.42" IsHitTestVisible="False" />
                                                <!-- Four Tarot Corner Gold Diamond Studs -->
                                                <Polygon Width="6" Height="6" HorizontalAlignment="Left" VerticalAlignment="Top" Margin="4"
                                                         Points="3,0 6,3 3,6 0,3" Fill="{DynamicResource GiltBrush}" IsHitTestVisible="False" />
                                                <Polygon Width="6" Height="6" HorizontalAlignment="Right" VerticalAlignment="Top" Margin="4"
                                                         Points="3,0 6,3 3,6 0,3" Fill="{DynamicResource GiltBrush}" IsHitTestVisible="False" />
                                                <Polygon Width="6" Height="6" HorizontalAlignment="Left" VerticalAlignment="Bottom" Margin="4"
                                                         Points="3,0 6,3 3,6 0,3" Fill="{DynamicResource GiltBrush}" IsHitTestVisible="False" />
                                                <Polygon Width="6" Height="6" HorizontalAlignment="Right" VerticalAlignment="Bottom" Margin="4"
                                                         Points="3,0 6,3 3,6 0,3" Fill="{DynamicResource GiltBrush}" IsHitTestVisible="False" />

                                                <StackPanel Margin="14,12,20,14" Width="{DynamicResource ${paneWidthKey}}">
                                                    <!-- Tarot Crest Header -->
                                                    <Grid Margin="0,0,0,8" IsHitTestVisible="False">
                                                        <Grid.ColumnDefinitions>
                                                            <ColumnDefinition Width="*" />
                                                            <ColumnDefinition Width="Auto" />
                                                            <ColumnDefinition Width="*" />
                                                        </Grid.ColumnDefinitions>
                                                        <Rectangle Grid.Column="0" Height="1" VerticalAlignment="Center" Fill="{DynamicResource GiltDimBrush}" Opacity="0.7" />
                                                        <TextBlock Grid.Column="1" Text="UMBRAN ARCHIVE" Margin="8,0"
                                                                   FontFamily="{DynamicResource HeadingFontFamily}" FontSize="14" FontWeight="Bold"
                                                                   Foreground="{DynamicResource HeadingForegroundBrush}" VerticalAlignment="Center" />
                                                        <Rectangle Grid.Column="2" Height="1" VerticalAlignment="Center" Fill="{DynamicResource GiltDimBrush}" Opacity="0.7" />
                                                    </Grid>

                                                    <Border>
                                                        <StackPanel>
${indent(metaBlocks, 60)}
                                                        </StackPanel>
                                                    </Border>
                                                </StackPanel>
                                            </Grid>
                                        </Border>
                                    </Grid>
                                </StackPanel>
                            </Grid>
                        </ScrollViewer>

                        <!-- Empty Game State Sanctuary (shown when no game is selected) -->
                        <Control x:Name="EmptyState" Template="{DynamicResource EmptyGameTemplate}" IsHitTestVisible="False">
                            <Control.Style>
                                <Style TargetType="Control">
                                    <Setter Property="Visibility" Value="Collapsed" />
                                    <Style.Triggers>
                                        <DataTrigger Binding="{Binding Game, FallbackValue={x:Null}}" Value="{x:Null}">
                                            <Setter Property="Visibility" Value="Visible" />
                                        </DataTrigger>
                                    </Style.Triggers>
                                </Style>
                            </Control.Style>
                        </Control>${cornerClose}
                    </Grid>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;
}

const outDir = resolveThemeSrcDir(import.meta.url);
writeOverviews(outDir, buildOverview('Details'), buildOverview('Grid'));
