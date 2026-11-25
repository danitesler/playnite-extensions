// Generates Swallowtail DetailsViewGameOverview.xaml & GridViewGameOverview.xaml using shared overview helpers
// and runs scripts/game-page-breakpoints.mjs automatically for Left / Center / Stretch / Right metadata positioning.
// Usage: node src/themes/Swallowtail/art/gen-overviews.mjs
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

// Custom 28x28 RTMI Notched 8-Point Octagon side-panel close bezel: dark harbor-teal plate in a 1.5px
// Deep Aqua notched octagon rim with 14px Ivory close glyph; hover smoothly fills Overwrite Crimson (#D4343B).
const swallowtailCloseTemplate = `<ControlTemplate TargetType="{x:Type Button}">
    <Grid Background="Transparent" SnapsToDevicePixels="True">
        <Path x:Name="Plate" Stretch="Uniform"
              Fill="{DynamicResource PopupBackgroundBrush}"
              Stroke="{DynamicResource NormalBorderBrush}" StrokeThickness="1.5"
              Data="{DynamicResource LocalNotchedOctagonGeometry}" IsHitTestVisible="False" />
        <Path x:Name="HoverPlate" Stretch="Uniform"
              Fill="{DynamicResource DangerBrush}"
              Stroke="{DynamicResource GiltHotBrush}" StrokeThickness="1.5"
              Data="{DynamicResource LocalNotchedOctagonGeometry}"
              Opacity="0" IsHitTestVisible="False" />
        <ContentControl x:Name="Glyph" Width="13" Height="13"
                        HorizontalAlignment="Center" VerticalAlignment="Center"
                        IsHitTestVisible="False" Content="{DynamicResource IconWindowClose}"
                        ContentTemplate="{DynamicResource IconTemplate}" Foreground="{DynamicResource TextBrush}" />
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
            <Setter TargetName="HoverPlate" Property="Opacity" Value="0.78" />
        </Trigger>
    </ControlTemplate.Triggers>
</ControlTemplate>`;

const fieldOptions = {
  margin: '0,4',
  captionFontWeight: 'Bold',
  captionFontSize: 'FontSizeSmall',
  captionForeground: 'ParchmentLabelBrush',
  captionVerticalAlignment: 'Top',
  captionStackMargin: '0,2,0,0',
  valueOptions: { textForeground: 'ParchmentTextBrush', chipsMargin: '0,0,0,-4', itemsWrapPanel: true },
};

// Sepia-ink skull-centered tapered hairline between metadata groups (Height=10 + Margin bottom 6 = 16; group top 8 = 24).
const groupBreak = `<Control Template="{DynamicResource LocalParchmentDividerTemplate}" Focusable="False" IsTabStop="False" IsHitTestVisible="False"
         Margin="0,0,0,6" />`;

// Torn-edge Return to Monkey Island parchment ledger sheet (Controls map / TODO list / LeChuck pamphlet style)
// crowned by a Deep Aqua swallowtail bookmark tab carrying the Pirate Gold crest, holding 300px of usable metadata content.
function renderMetadataPane(widthKey) {
  const blocks = META_GROUPS.map(g => metadataGroup(g, 'stack', {
    margin: '0,8,0,0',
    padding: '0',
    borderThickness: '',
    borderBrush: '',
    beforeFields: groupBreak,
    fieldOptions,
  })).join('\n');

  return `<Grid VerticalAlignment="Top" SnapsToDevicePixels="True">
    <Grid.RowDefinitions>
        <RowDefinition Height="20" />
        <RowDefinition Height="*" />
    </Grid.RowDefinitions>

    <!-- Wavy Deep Aqua swallowtail bookmark tab pinning the parchment ledger to the stage -->
    <Grid Grid.Row="0" Width="136" HorizontalAlignment="Center" Margin="0,0,0,-4" Panel.ZIndex="2" IsHitTestVisible="False">
        <Control Template="{DynamicResource LocalSwallowtailRibbonTemplate}"
                 Background="{DynamicResource HeaderBandBrush}"
                 Foreground="{DynamicResource LinkBrush}" />
        <Control Width="14" Height="14" HorizontalAlignment="Center" VerticalAlignment="Center"
                 Template="{DynamicResource BrandMarkTemplate}" Foreground="{DynamicResource GiltBrush}" />
    </Grid>

    <!-- Warm torn-edge aged parchment sheet framing 300px usable dark-ink metadata content -->
    <Grid Grid.Row="1" TextElement.Foreground="{DynamicResource ParchmentTextBrush}">
        <Control Template="{DynamicResource LocalParchmentSheetTemplate}" />
        <Border Padding="16,14,16,14">
            <StackPanel Width="{DynamicResource ${widthKey}}">
                <Grid ClipToBounds="True">
                    <StackPanel Margin="0,-24,0,-4">
${indent(blocks, 24)}
                    </StackPanel>
                </Grid>
            </StackPanel>
        </Border>
    </Grid>
</Grid>`;
}

const sectionHeading = (loc) => `<DockPanel Margin="0,0,0,10">
    <TextBlock DockPanel.Dock="Left" Text="{DynamicResource ${loc}}" Style="{DynamicResource HeadingTextBlock}" Margin="0,0,10,0" />
    <Rectangle Height="1.5" VerticalAlignment="Center" Fill="{DynamicResource HeadingRuleBrush}" IsHitTestVisible="False">
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

// Hero Banner: plain vertical gradient fade into PageRoot.Background.Color (NO OpacityMask on art behind animated PlayButton),
// framed by subtle nocturnal theater curtain corner drapes and a 2px Deep Aqua top stage seam.
const heroBanner = `<Grid x:Name="HeroArt" VerticalAlignment="Top" IsHitTestVisible="False">
${indent(heroVisibilityStyle(), 4)}
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill" />
${indent(bannerDarkeningFloor(), 4)}
    <!-- Subtle dark-aqua stage curtains framing top-left and top-right corners -->
    <Rectangle Width="136" HorizontalAlignment="Left" Fill="{DynamicResource NormalBrush}" Opacity="0.38"
               OpacityMask="{DynamicResource LocalCurtainDrapeMask}" />
    <Rectangle Width="136" HorizontalAlignment="Right" Fill="{DynamicResource NormalBrush}" Opacity="0.38"
               OpacityMask="{DynamicResource LocalCurtainDrapeMask}" RenderTransformOrigin="0.5,0.5">
        <Rectangle.RenderTransform>
            <ScaleTransform ScaleX="-1" />
        </Rectangle.RenderTransform>
    </Rectangle>
    <!-- Smooth vertical fade into nocturnal harbor stage -->
    <Rectangle>
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                <GradientStop Color="#14070C12" Offset="0" />
                <GradientStop Color="#66070C12" Offset="0.52" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
    <!-- 2px Deep Aqua stage top seam -->
    <Rectangle Height="2" VerticalAlignment="Top" Fill="{DynamicResource NormalBorderBrush}" Opacity="0.75" />
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

const titleStack = `<Grid VerticalAlignment="Center">
    <!-- Crisp dark ink outline & theatrical shadow echoing Return to Monkey Island's carved title lettering -->
    <TextBlock Text="{Binding Text, ElementName=PART_TextDisplayName}" VerticalAlignment="Center"
               FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLargest}"
               Foreground="{DynamicResource LocalGameTitleOutlineBrush}" TextWrapping="Wrap"
               Margin="-2,-1.5,2,1.5" IsHitTestVisible="False" />
    <TextBlock Text="{Binding Text, ElementName=PART_TextDisplayName}" VerticalAlignment="Center"
               FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLargest}"
               Foreground="{DynamicResource LocalGameTitleOutlineBrush}" TextWrapping="Wrap"
               Margin="2,-1.5,-2,1.5" IsHitTestVisible="False" />
    <TextBlock Text="{Binding Text, ElementName=PART_TextDisplayName}" VerticalAlignment="Center"
               FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLargest}"
               Foreground="{DynamicResource LocalGameTitleOutlineBrush}" TextWrapping="Wrap"
               Margin="-2,2,2,-2" IsHitTestVisible="False" />
    <TextBlock Text="{Binding Text, ElementName=PART_TextDisplayName}" VerticalAlignment="Center"
               FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLargest}"
               Foreground="{DynamicResource LocalGameTitleOutlineBrush}" TextWrapping="Wrap"
               Margin="2,2.5,-2,-2.5" IsHitTestVisible="False" />
    <TextBlock x:Name="PART_TextDisplayName" VerticalAlignment="Center"
               FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLargest}"
               Foreground="{DynamicResource LocalGameTitleBrush}" TextWrapping="Wrap" />
</Grid>`;

// Atmospheric sea-chart gouache backdrop + subtle side curtains + sketchy pirate items behind main content.
const stageTextureBackdrop = `<Grid IsHitTestVisible="False" ClipToBounds="True">
    <Rectangle Fill="{DynamicResource NormalBrush}" Opacity="0.16"
               OpacityMask="{DynamicResource LocalStageChartMask}" />
    <Rectangle Width="120" HorizontalAlignment="Left" Fill="{DynamicResource NormalBrush}" Opacity="0.16"
               OpacityMask="{DynamicResource LocalCurtainDrapeMask}" />
    <Rectangle Width="120" HorizontalAlignment="Right" Fill="{DynamicResource NormalBrush}" Opacity="0.16"
               OpacityMask="{DynamicResource LocalCurtainDrapeMask}" RenderTransformOrigin="0.5,0.5">
        <Rectangle.RenderTransform>
            <ScaleTransform ScaleX="-1" />
        </Rectangle.RenderTransform>
    </Rectangle>
    <Control Template="{DynamicResource LocalStageSketchesTemplate}" />
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

const detailsXaml = `<!--
    Swallowtail: Views/DetailsViewGameOverview.xaml (generated by art/gen-overviews.mjs).
    - Nocturnal theater curtain hero banner (GameBannerHeight=300, spacer x * 204 / 300 floor 18) with
      Dark Aqua GameBannerTintBrush darkening + 50% floor.
    - Header: Framed game icon + Constantia Bold title + Curled Pirate-Gold PlayButton + Ghost-Ship Emerald
      RunningActionIndicator + equal 40x40 icon-only SecondaryButton More & Edit.
    - Body: SteamScreenshotsGameScope + Description/Notes beside the Swallowtail-ribbon-crowned Harbor Dossier
      (GameDetailsPaneWidth=300 usable content, GameDetailsPanePosition Left / Center / Stretch / Right).
    - Empty state: Curtained Harbor Stage EmptyGameTemplate centered in ViewportHeight (PART_ScrollViewHost Visible).
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
${indent(stageTextureBackdrop, 28)}
${indent(heroBanner, 28)}
                            <StackPanel Margin="26,0,26,28">
${indent(hideWhenNoGame('StackPanel'), 32)}
${indent(bannerSpacer('x * 204 / 300', 18, 'DetailsBannerSpacer'), 32)}
                                <DockPanel Margin="0,8,0,14">
                                    <StackPanel Orientation="Horizontal" DockPanel.Dock="Right" VerticalAlignment="Center" Margin="18,0,0,0">
${indent(actionsRow, 40)}
                                    </StackPanel>
                                    <DockPanel>
                                        <Border DockPanel.Dock="Left" VerticalAlignment="Center" Margin="0,0,14,0"
                                                Visibility="{Binding Visibility, ElementName=PART_ImageIcon}"
                                                CornerRadius="{DynamicResource CornerRadiusLarge}" Padding="3"
                                                Background="{DynamicResource PopupBackgroundBrush}"
                                                BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="1.5">
                                            <Image x:Name="PART_ImageIcon" MaxWidth="44" MaxHeight="44" />
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
    Swallowtail: Views/GridViewGameOverview.xaml (generated by art/gen-overviews.mjs).
    - Nocturnal theater curtain hero banner (GameBannerHeight=300, spacer x * 196 / 300 floor 14).
    - CloseGameSideBarCommand: custom 28x28 RTMI notched-octagon close bezel turning Overwrite Crimson on hover;
      inline sticky left of game icon below 120px or when ShowBackgroundImageOnWindow=True, corner 12,12 otherwise.
    - Actions under title: Curled Pirate-Gold PlayButton + Ghost-Ship Emerald RunningActionIndicator + equal 40x40 More & Edit.
    - Swallowtail-ribbon-crowned Harbor Dossier (GridDetailsPaneWidth=300 usable width, GameDetailsPanePosition).
    - Empty state: Curtained Harbor Stage EmptyGameTemplate centered in ViewportHeight when Game is null.
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
${indent(stageTextureBackdrop, 36)}
${indent(heroBanner, 36)}
                                    <StackPanel Panel.ZIndex="2" Margin="22,0,22,26">
${indent(hideWhenNoGame('StackPanel'), 40)}
${indent(bannerSpacer('x * 196 / 300', 14, 'GridBannerSpacer'), 40)}
                                        <StackPanel Panel.ZIndex="2" Margin="0,8,0,14">
                                            <DockPanel Panel.ZIndex="2">
${indent(inlineCloseButton(), 48)}
                                                <Border DockPanel.Dock="Left" VerticalAlignment="Center" Margin="0,0,12,0"
                                                        Visibility="{Binding Visibility, ElementName=PART_ImageIcon}"
                                                        CornerRadius="{DynamicResource CornerRadiusLarge}" Padding="3"
                                                        Background="{DynamicResource PopupBackgroundBrush}"
                                                        BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="1.5">
                                                    <Image x:Name="PART_ImageIcon" MaxWidth="42" MaxHeight="42" />
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
${indent(sidePanelCloseButton({ template: swallowtailCloseTemplate, comment: '' }), 28)}
                        </Grid>
                    </Border>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;

writeOverviews(out, detailsXaml, gridXaml);
