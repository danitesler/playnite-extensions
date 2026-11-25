/**
 * Foldcraft overview generator (DetailsViewGameOverview.xaml & GridViewGameOverview.xaml).
 * Emits Foldcraft's Tearaway-inspired tactile papercraft game page:
 * - Hero Diorama Backdrop: full-bleed background art (GameBannerHeight=320, proportional
 *   MathConverter spacer with minimum floor) + GameBannerDarken & 50% floor + bottom paper fade
 *   and subtle Ochre/Cerulean cut-paper corner tabs.
 * - Header: Oswald condensed title (flips to WindowArtForegroundBrush over window art) + Hot-Magenta
 *   accent rule, Ochre-Gold PlayButton + Confetti Cobalt RunningActionIndicator + 40x40 folded cardstock
 *   SecondaryButton More & Edit.
 * - Metadata Dossier: Accordion-Folded Ivory Cardstock (#EAE3D2) with 3px studio paper shadow sheet
 *   (#C4BA9F), crowned at top-center by a cutting-mat Teal & Ochre folded bookmark seal tab, 300px
 *   usable inner width, GameDetailsPanePosition Left / Center / Stretch / Right via scripts/game-page-breakpoints.mjs.
 * - Empty state: Papercraft blueprint fold net + Origami Seal EmptyGameTemplate centered in ViewportHeight.
 * - Grid side panel: custom 28x28 circular grey cardstock SidePanelCloseButton (inline sticky when
 *   GameBannerHeight < 120 or ShowBackgroundImageOnWindow=True; top-left 12,12 otherwise).
 *
 * Usage:
 *   node src/themes/Foldcraft/art/gen-overviews.mjs [src/themes/Foldcraft/src]
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

// Custom 28x28 Circular Cut-Cardstock Close Disc (pale grey circle, Crimson X, solid Crimson disc hover)
const foldcraftCloseTemplate = `<ControlTemplate TargetType="{x:Type Button}">
    <Grid Background="Transparent" SnapsToDevicePixels="True">
        <Border x:Name="Disc" Background="{DynamicResource LocalCloseDiscBrush}"
                BorderBrush="{DynamicResource LocalCardstockGreyBrush}" BorderThickness="1.5"
                CornerRadius="{DynamicResource CornerRadiusFull}" IsHitTestVisible="False" />
        <Border x:Name="HoverDisc" Background="{DynamicResource DangerBrush}"
                BorderBrush="{DynamicResource DangerBrush}" BorderThickness="1.5"
                CornerRadius="{DynamicResource CornerRadiusFull}"
                Opacity="0" IsHitTestVisible="False" />
        <ContentControl x:Name="Glyph" Width="13" Height="13" HorizontalAlignment="Center" VerticalAlignment="Center"
                        IsHitTestVisible="False" Content="{DynamicResource IconWindowClose}" ContentTemplate="{DynamicResource IconTemplate}"
                        Foreground="{DynamicResource DangerBrush}" />
    </Grid>
    <ControlTemplate.Triggers>
        <Trigger Property="IsMouseOver" Value="True">
            <Setter TargetName="Glyph" Property="Foreground" Value="{DynamicResource DangerForegroundBrush}" />
            <Trigger.EnterActions>
                <BeginStoryboard><Storyboard>
                    <DoubleAnimation Storyboard.TargetName="HoverDisc" Storyboard.TargetProperty="Opacity" To="1" Duration="0:0:0.12" />
                </Storyboard></BeginStoryboard>
            </Trigger.EnterActions>
            <Trigger.ExitActions>
                <BeginStoryboard><Storyboard>
                    <DoubleAnimation Storyboard.TargetName="HoverDisc" Storyboard.TargetProperty="Opacity" To="0" Duration="0:0:0.15" />
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
        <TextBlock Grid.Column="0" Text="{DynamicResource ${loc}}" FontSize="{DynamicResource FontSizeSmall}" FontWeight="Bold" Foreground="{DynamicResource TextBrushDarker}" TextWrapping="Wrap" Margin="0,2,0,0" />
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

  return `<!-- Accordion-Folded Ivory Cardstock Metadata Dossier (300px usable inner width) -->
<Grid VerticalAlignment="Top" HorizontalAlignment="Stretch" Margin="0,8,0,0" SnapsToDevicePixels="True">
    <Border Margin="3,3,0,0" Background="{DynamicResource PanelShadowBrush}"
            CornerRadius="{DynamicResource CornerRadiusLarge}" IsHitTestVisible="False" />
    <Border Margin="0,0,3,3" Background="{DynamicResource NormalBrush}"
            BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="1.5"
            CornerRadius="{DynamicResource CornerRadiusLarge}" ClipToBounds="True">
        <Grid>
            <Control Template="{DynamicResource LocalPaperFibersTemplate}" Foreground="{DynamicResource PanelShadowBrush}"
                     Opacity="0.13" Focusable="False" IsHitTestVisible="False" />
            <Control Template="{DynamicResource LocalAccordionCreasesTemplate}" Foreground="{DynamicResource TextBrushDarker}"
                     Opacity="0.14" Focusable="False" IsHitTestVisible="False" />
            <!-- Accordion inner top crease lip -->
            <Border BorderBrush="{DynamicResource LocalPaperWhiteBrush}" BorderThickness="0,1.5,0,0" Opacity="0.5" IsHitTestVisible="False" />
            <Border Padding="16,18,16,14">
                <StackPanel Width="{DynamicResource ${widthKey}}">
                    <Control Template="{DynamicResource LocalCardFoldDividerTemplate}" Margin="0,0,0,10" Focusable="False" />
                    <Grid ClipToBounds="True">
                        <StackPanel Margin="0,-29,0,-7">
${indent(blocks, 28)}
                        </StackPanel>
                    </Grid>
                </StackPanel>
            </Border>
        </Grid>
    </Border>
    <!-- Cutting-Mat Teal & Ochre Bookmark Tab centered along the dossier top fold -->
    <Grid Height="12" Width="84" HorizontalAlignment="Center" VerticalAlignment="Top" Margin="0,-6,0,0" IsHitTestVisible="False">
        <Border Background="{DynamicResource ShellBackgroundBrush}" BorderBrush="{DynamicResource NormalBorderBrush}"
                BorderThickness="1.5" CornerRadius="{DynamicResource CornerRadiusSmall}">
            <StackPanel Orientation="Horizontal" HorizontalAlignment="Center" VerticalAlignment="Center">
                <Rectangle Width="18" Height="3" Margin="0,0,6,0" Fill="{DynamicResource LocalGoldSealBrush}" />
                <Path Width="6" Height="6" Stretch="Fill" Data="M 3,0 L 6,3 L 3,6 L 0,3 Z" Fill="{DynamicResource LocalPaperWhiteBrush}" />
                <Rectangle Width="18" Height="3" Margin="6,0,0,0" Fill="{DynamicResource LocalMagentaBrush}" />
            </StackPanel>
        </Border>
    </Grid>
</Grid>`;
}

const sectionHeading = (loc) => `<DockPanel Margin="0,0,0,10">
    <Path DockPanel.Dock="Left" Width="8" Height="8" Margin="0,0,8,0" VerticalAlignment="Center" Stretch="Fill"
          Data="M 4,0 L 8,4 L 4,8 L 0,4 Z" Fill="{DynamicResource LocalMagentaBrush}" IsHitTestVisible="False" />
    <TextBlock DockPanel.Dock="Left" Text="{DynamicResource ${loc}}" Margin="0,0,10,0">
        <TextBlock.Style>
            <Style TargetType="TextBlock" BasedOn="{StaticResource HeadingTextBlock}">
                <Style.Triggers>
                    <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                        <Setter Property="Foreground" Value="{DynamicResource WindowArtForegroundBrush}" />
                    </DataTrigger>
                </Style.Triggers>
            </Style>
        </TextBlock.Style>
    </TextBlock>
    <Control Template="{DynamicResource LocalCardFoldDividerTemplate}" VerticalAlignment="Center" Focusable="False" />
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
        <Grid SnapsToDevicePixels="True">
            <Border Margin="2,2,0,0" Background="{DynamicResource PanelShadowBrush}" CornerRadius="{DynamicResource ControlCornerRadius}" IsHitTestVisible="False">
                <Border.Style>
                    <Style TargetType="Border">
                        <Style.Triggers>
                            <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                                <Setter Property="Visibility" Value="Collapsed" />
                            </DataTrigger>
                        </Style.Triggers>
                    </Style>
                </Border.Style>
            </Border>
            <Border Margin="0,0,2,2" BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="1.5"
                    CornerRadius="{DynamicResource ControlCornerRadius}">
                <Border.Style>
                    <Style TargetType="Border">
                        <Setter Property="Background" Value="{DynamicResource LocalPaperWhiteBrush}" />
                        <Style.Triggers>
                            <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                                <Setter Property="Background" Value="Transparent" />
                                <Setter Property="BorderThickness" Value="0" />
                            </DataTrigger>
                        </Style.Triggers>
                    </Style>
                </Border.Style>
                <Grid>
                    <Control Template="{DynamicResource LocalPaperFibersTemplate}" Foreground="{DynamicResource PanelShadowBrush}"
                             Opacity="0.12" Focusable="False" IsHitTestVisible="False">
                        <Control.Style>
                            <Style TargetType="Control">
                                <Style.Triggers>
                                    <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                                        <Setter Property="Visibility" Value="Collapsed" />
                                    </DataTrigger>
                                </Style.Triggers>
                            </Style>
                        </Control.Style>
                    </Control>
                    <Grid>
                        <Grid.Style>
                            <Style TargetType="Grid">
                                <Setter Property="Margin" Value="14,12" />
                                <Style.Triggers>
                                    <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                                        <Setter Property="Margin" Value="0" />
                                    </DataTrigger>
                                </Style.Triggers>
                            </Style>
                        </Grid.Style>
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
                    </Grid>
                </Grid>
            </Border>
        </Grid>
    </StackPanel>
    <StackPanel x:Name="PART_ElemNotes" Margin="0,20,0,0">
${indent(sectionHeading('LOCNotesLabel'), 8)}
        <TextBox x:Name="PART_TextNotes" IsReadOnly="True" TextWrapping="Wrap"
                 Background="{DynamicResource NormalBrush}" BorderBrush="{DynamicResource NormalBorderBrush}"
                 BorderThickness="1.5" Padding="12,10" />
    </StackPanel>
</StackPanel>`;

const heroBanner = `<Grid x:Name="HeroArt" VerticalAlignment="Top" IsHitTestVisible="False">
${indent(heroVisibilityStyle(), 4)}
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill" />
${indent(bannerDarkeningFloor(), 4)}
    <!-- Ochre & Cerulean Corner Origami Tabs tucked inside hero upper frame -->
    <Path HorizontalAlignment="Left" VerticalAlignment="Top" Margin="20,12,0,0" Width="18" Height="18" Stretch="Fill"
          Data="M 0,0 L 18,0 L 0,18 Z" Fill="{DynamicResource PrimaryButtonBackgroundBrush}" Opacity="0.92" />
    <Path HorizontalAlignment="Right" VerticalAlignment="Top" Margin="0,12,20,0" Width="18" Height="18" Stretch="Fill"
          Data="M 0,0 L 18,0 L 18,18 Z" Fill="{DynamicResource LocalCeruleanBrush}" Opacity="0.92" />
    <!-- Smooth warm paper bottom fade so Oswald title & Ochre Play CTA remain crisp -->
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
    <Grid Height="2.5" Margin="0,4,0,0">
${indent(hideWhenNoTitle('Grid'), 8)}
        <Rectangle Fill="{DynamicResource PanelSeparatorBrush}" />
        <Rectangle Width="56" HorizontalAlignment="Left" Fill="{DynamicResource LocalMagentaBrush}" />
    </Grid>
</StackPanel>`;

const pageCollage = `<Canvas HorizontalAlignment="Right" VerticalAlignment="Bottom" Width="0" Height="0" IsHitTestVisible="False">
    <Canvas.Style>
        <Style TargetType="Canvas">
            <Style.Triggers>
                <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                    <Setter Property="Visibility" Value="Collapsed" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Canvas.Style>
    <Path Canvas.Left="-210" Canvas.Top="-165" Data="M 210,165 L 210,18 L 62,165 Z"
          Fill="{DynamicResource SelectedBrush}" Opacity="0.4" />
    <Path Canvas.Left="-164" Canvas.Top="-130" Data="M 164,130 L 164,10 L 44,130 Z"
          Fill="{DynamicResource LocalCeruleanBrush}" Opacity="0.3" />
    <Path Canvas.Left="-116" Canvas.Top="-94" Data="M 116,94 L 116,6 L 26,94 Z"
          Fill="{DynamicResource PrimaryButtonBackgroundBrush}" Opacity="0.36" />
    <Path Canvas.Left="-68" Canvas.Top="-58" Data="M 68,58 L 68,4 L 14,58 Z"
          Fill="{DynamicResource LocalMagentaBrush}" Opacity="0.28" />
    <Control Canvas.Left="-98" Canvas.Top="-98" Width="56" Height="56"
             Template="{DynamicResource BrandMarkTemplate}"
             Foreground="{DynamicResource TextBrushDarker}" Opacity="0.09"
             Focusable="False" IsHitTestVisible="False" />
</Canvas>`;

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
    Foldcraft: Views/DetailsViewGameOverview.xaml (generated by art/gen-overviews.mjs).
    - Papercraft hero banner (GameBannerHeight=320, spacer x * 246 / 320 floor 20) with GameBannerDarken + 50% floor.
    - Header: Game icon + Oswald display title (flips to WindowArtForegroundBrush on window art) + Hot-Magenta rule
      + Ochre PlayButton + Confetti Cobalt RunningActionIndicator + equal 40x40 cardstock SecondaryButton More & Edit.
    - Body: SteamScreenshotsGameScope + Paper White Description card + Notes alongside Accordion Ivory Cardstock Metadata
      (300px usable width, GameDetailsPanePosition Left / Center / Stretch / Right via scripts/game-page-breakpoints.mjs).
    - Empty state: Papercraft blueprint fold net + Origami Seal EmptyGameTemplate centered in ViewportHeight.
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
${indent(pageCollage, 28)}
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
    Foldcraft: Views/GridViewGameOverview.xaml (generated by art/gen-overviews.mjs).
    - Papercraft hero banner (GameBannerHeight=320, spacer x * 224 / 320 floor 14) with GameBannerDarken + 50% floor.
    - CloseGameSideBarCommand: custom 28x28 circular grey cardstock SidePanelCloseButton (solid Crimson hover);
      inline sticky left of icon when GameBannerHeight < 120 or ShowBackgroundImageOnWindow=True, corner 12,12 otherwise.
    - Actions under title: Ochre PlayButton + Confetti Cobalt RunningActionIndicator + equal 40x40 SecondaryButton More & Edit.
    - Accordion Ivory Cardstock Metadata (GridDetailsPaneWidth=300 usable width, 2*:3* columns, GameDetailsPanePosition).
    - Empty state: Papercraft blueprint fold net + Origami Seal EmptyGameTemplate centered in ViewportHeight when Game is null.
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
${indent(pageCollage, 36)}
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
${indent(sidePanelCloseButton({ template: foldcraftCloseTemplate, comment: '' }), 28)}
                        </Grid>
                    </Border>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;

writeOverviews(out, detailsXaml, gridXaml);
