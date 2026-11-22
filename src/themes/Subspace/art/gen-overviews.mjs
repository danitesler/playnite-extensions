// Generates Subspace DetailsViewGameOverview.xaml & GridViewGameOverview.xaml from shared overview helpers.
// Usage: node src/themes/Subspace/art/gen-overviews.mjs
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

// Custom 28x28 LCARS right-rounded endcap close key: #141824 surface with 4px Peach leading stub +
// 1.5px Peach rim + 14px Space White IconWindowClose; hover smoothly fills Red Alert Crimson (#C42828).
const subspaceCloseTemplate = `<ControlTemplate TargetType="{x:Type Button}">
    <Grid Background="Transparent" SnapsToDevicePixels="True">
        <Border x:Name="Plate" Background="{DynamicResource NormalBrush}"
                BorderBrush="{DynamicResource LocalPeachBrush}" BorderThickness="1.5"
                CornerRadius="4,14,14,4">
            <Grid ClipToBounds="True">
                <Border x:Name="LeadStub" Width="4" HorizontalAlignment="Left"
                        Background="{DynamicResource LocalPeachBrush}"
                        BorderBrush="{DynamicResource ShellBackgroundBrush}" BorderThickness="0,0,1.5,0"
                        IsHitTestVisible="False" />
                <Border x:Name="HoverPlate" CornerRadius="2.5,12.5,12.5,2.5"
                        Background="{DynamicResource DangerBrush}" Opacity="0" IsHitTestVisible="False" />
                <ContentControl x:Name="Glyph" Width="13" Height="13" Margin="2,0,0,0"
                                HorizontalAlignment="Center" VerticalAlignment="Center"
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

// Tri-block LCARS segmented divider between metadata groups (Height=10 + Margin bottom 6 = 16; group top 10 = 26).
const groupBreak = `<Control Template="{DynamicResource DividerTemplate}" Focusable="False" IsTabStop="False" IsHitTestVisible="False"
         Margin="0,0,0,6" />`;

// Okudagram Framed Telemetry Dossier: 14px mini top-left Tangerine/Peach/Violet/Periwinkle LCARS elbow +
// 8px segmented left spine + 8x8 concave inner fillet framing 300px of calm #0B0D14 rows.
function renderMetadataPane(widthKey) {
  const blocks = META_GROUPS.map(g => metadataGroup(g, 'stack', {
    margin: '0,10,0,0',
    padding: '0',
    borderThickness: '',
    borderBrush: '',
    beforeFields: groupBreak,
    fieldOptions,
  })).join('\n');

  return `<Grid VerticalAlignment="Top" SnapsToDevicePixels="True">
    <Grid.RowDefinitions>
        <RowDefinition Height="14" />
        <RowDefinition Height="*" />
    </Grid.RowDefinitions>
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="8" />
        <ColumnDefinition Width="*" />
    </Grid.ColumnDefinitions>

    <!-- Top segmented LCARS elbow header -->
    <Grid Grid.Row="0" Grid.Column="0" Grid.ColumnSpan="2" IsHitTestVisible="False">
        <Grid.ColumnDefinitions>
            <ColumnDefinition Width="34" />
            <ColumnDefinition Width="3" />
            <ColumnDefinition Width="68" />
            <ColumnDefinition Width="3" />
            <ColumnDefinition Width="*" />
            <ColumnDefinition Width="3" />
            <ColumnDefinition Width="36" />
        </Grid.ColumnDefinitions>
        <Border Grid.Column="0" Background="{DynamicResource StripeBrush}" CornerRadius="12,0,0,0" />
        <Rectangle Grid.Column="2" Fill="{DynamicResource StripeAltBrush}" />
        <Rectangle Grid.Column="4" Fill="{DynamicResource GlyphBrush}" />
        <Border Grid.Column="6" Background="{DynamicResource StripeDeepBrush}" CornerRadius="0,7,7,0" />
    </Grid>

    <!-- 8px segmented left LCARS elbow spine -->
    <Grid Grid.Row="1" Grid.Column="0" IsHitTestVisible="False">
        <Grid.RowDefinitions>
            <RowDefinition Height="76" />
            <RowDefinition Height="3" />
            <RowDefinition Height="108" />
            <RowDefinition Height="3" />
            <RowDefinition Height="*" />
        </Grid.RowDefinitions>
        <Rectangle Grid.Row="0" Fill="{DynamicResource StripeBrush}" />
        <Rectangle Grid.Row="2" Fill="{DynamicResource GlyphBrush}" />
        <Border Grid.Row="4" Background="{DynamicResource StripeDeepBrush}" CornerRadius="0,0,0,6" />
    </Grid>

    <!-- Calm #0B0D14 interior dossier holding 300px usable metadata content -->
    <Border Grid.Row="1" Grid.Column="1" Background="{DynamicResource PopupBackgroundBrush}"
            BorderBrush="{DynamicResource PanelSeparatorBrush}" BorderThickness="0,0,1,1"
            CornerRadius="0,0,8,0">
        <Grid>
            <Path Width="8" Height="8" HorizontalAlignment="Left" VerticalAlignment="Top"
                  Fill="{DynamicResource StripeBrush}" Data="M0,0 L8,0 A8,8 0 0,0 0,8 Z"
                  IsHitTestVisible="False" />
            <Border Padding="14,12,14,12">
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
</Grid>`;
}

const sectionHeading = (loc, capBrush = 'StripeBrush', endBrush = 'GlyphBrush') => `<DockPanel Margin="0,0,0,10">
    <Border DockPanel.Dock="Left" Width="18" Height="11" Margin="0,0,8,0" VerticalAlignment="Center"
            CornerRadius="5.5,0,0,5.5" Background="{DynamicResource ${capBrush}}" IsHitTestVisible="False" />
    <TextBlock DockPanel.Dock="Left" Text="{DynamicResource ${loc}}" Style="{DynamicResource HeadingTextBlock}" Margin="0,0,10,0" />
    <Border DockPanel.Dock="Right" Width="22" Height="6" Margin="4,0,0,0" VerticalAlignment="Center"
            CornerRadius="0,3,3,0" Background="{DynamicResource ${endBrush}}" IsHitTestVisible="False" />
    <Border Height="6" VerticalAlignment="Center" CornerRadius="0,3,3,0"
            Background="{DynamicResource LocalPeriwinkleDimBrush}" IsHitTestVisible="False" />
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
${indent(sectionHeading('LOCGameDescriptionTitle', 'GlyphBrush', 'StripeAltBrush'), 8)}
        <HtmlTextView x:Name="PART_HtmlDescription" HtmlFontFamily="{DynamicResource FontFamily}" HtmlFontSize="{DynamicResource FontSize}"
                      TextElement.Foreground="{DynamicResource TextBrush}"
                      Tag="{DynamicResource LinkBrush}"
                      HtmlForeground="{Binding Path=(TextElement.Foreground).Color, RelativeSource={RelativeSource Self}}"
                      LinkForeground="{Binding Tag.Color, RelativeSource={RelativeSource Self}}" />
    </StackPanel>
    <StackPanel x:Name="PART_ElemNotes" Margin="0,20,0,0">
${indent(sectionHeading('LOCNotesLabel', 'StripeAltBrush', 'StripeDeepBrush'), 8)}
        <TextBox x:Name="PART_TextNotes" IsReadOnly="True" TextWrapping="Wrap" Style="{DynamicResource LocalNotesTextBox}" />
    </StackPanel>
</StackPanel>`;

const heroBanner = `<Grid x:Name="HeroArt" VerticalAlignment="Top" IsHitTestVisible="False">
${indent(heroVisibilityStyle(), 4)}
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill" />
${indent(bannerDarkeningFloor(), 4)}
    <!-- Segmented LCARS top viewscreen tracking rail -->
    <Grid Height="4" Margin="24,10,24,0" VerticalAlignment="Top">
        <Grid.ColumnDefinitions>
            <ColumnDefinition Width="72" />
            <ColumnDefinition Width="3" />
            <ColumnDefinition Width="28" />
            <ColumnDefinition Width="3" />
            <ColumnDefinition Width="*" />
            <ColumnDefinition Width="3" />
            <ColumnDefinition Width="46" />
        </Grid.ColumnDefinitions>
        <Border Grid.Column="0" CornerRadius="2,0,0,2" Background="{DynamicResource StripeBrush}" />
        <Rectangle Grid.Column="2" Fill="{DynamicResource StripeAccentBrush}" />
        <Rectangle Grid.Column="4" Fill="{DynamicResource LocalPeriwinkleBrush}" Opacity="0.35" />
        <Border Grid.Column="6" CornerRadius="0,2,2,0" Background="{DynamicResource GlyphBrush}" />
    </Grid>
    <!-- Smooth vertical fade into pure #000000 bridge console -->
    <Rectangle>
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                <GradientStop Color="#240E0A18" Offset="0" />
                <GradientStop Color="#780E0A18" Offset="0.52" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
    <Rectangle>
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0" EndPoint="1,0">
                <GradientStop Color="#A6000000" Offset="0" />
                <GradientStop Color="#0D000000" Offset="0.45" />
                <GradientStop Color="#59000000" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
</Grid>`;

const actionsRow = `<Grid MinWidth="170" Height="40">
    <Button x:Name="PART_ButtonPlayAction" Style="{DynamicResource PlayButton}" />
    <Button x:Name="PART_ButtonContextAction" Tag="ContextAction" Style="{DynamicResource PlayButton}" />
    <Control Style="{DynamicResource RunningActionIndicator}" />
</Grid>
<Button x:Name="PART_ButtonMoreActions" Width="40" Height="40" Padding="0" Style="{DynamicResource SecondaryButton}" Margin="8,0,0,0" ToolTip="{DynamicResource LOCMoreAction}">
    <ContentControl Content="{DynamicResource IconOptions}" ContentTemplate="{DynamicResource IconTemplate}" Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
</Button>
<Button x:Name="PART_ButtonEditGame" Width="40" Height="40" Padding="0" Tag="RightCap" Style="{DynamicResource SecondaryButton}" Margin="6,0,0,0" ToolTip="{DynamicResource LOCEditGame}">
    <ContentControl Content="{DynamicResource IconEdit}" ContentTemplate="{DynamicResource IconTemplate}" Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
</Button>`;

const titleStack = `<StackPanel VerticalAlignment="Center">
    <StackPanel Orientation="Horizontal" Margin="0,0,0,5" IsHitTestVisible="False">
        <Border Width="22" Height="4" CornerRadius="2,0,0,2" Background="{DynamicResource StripeBrush}" />
        <Rectangle Width="12" Height="4" Margin="3,0,0,0" Fill="{DynamicResource GlyphBrush}" />
        <Border Width="34" Height="4" Margin="3,0,0,0" CornerRadius="0,2,2,0" Background="{DynamicResource StripeDeepBrush}" />
    </StackPanel>
    <TextBlock x:Name="PART_TextDisplayName" VerticalAlignment="Center"
               FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLargest}"
               Foreground="{DynamicResource TextBrush}" TextWrapping="Wrap" />
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
    Subspace: Views/DetailsViewGameOverview.xaml (generated by art/gen-overviews.mjs).
    - LCARS viewscreen hero banner (GameBannerHeight=300, spacer x * 224 / 300 floor 18) with GameBannerDarken + 50% floor.
    - Header: Game icon + tri-pip LCARS eyebrow + Pathway Gothic One title + dual-endcap Tangerine/Gold PlayButton +
      Warp Ops Teal RunningActionIndicator + equal 40x40 icon-only SecondaryButton More & Edit.
    - Body: SteamScreenshotsGameScope + LCARS inline-bar Description/Notes alongside Okudagram Framed Telemetry Dossier
      (GameDetailsPaneWidth=300 usable width, GameDetailsPanePosition Left / Center / Stretch / Right via
      scripts/game-page-breakpoints.mjs).
    - Empty state: Subspace Calibration Viewscreen EmptyGameTemplate centered in ViewportHeight (PART_ScrollViewHost Visible).
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
                                                CornerRadius="10" Padding="2"
                                                Background="{DynamicResource PopupBackgroundBrush}"
                                                BorderBrush="{DynamicResource StripeBrush}" BorderThickness="1.5">
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
    Subspace: Views/GridViewGameOverview.xaml (generated by art/gen-overviews.mjs).
    - LCARS viewscreen hero banner (GameBannerHeight=300, spacer x * 214 / 300 floor 14) with GameBannerDarken + 50% floor.
    - CloseGameSideBarCommand: custom 28x28 LCARS right-rounded Peach-stubbed close key turning Red Alert on hover;
      inline sticky left of icon when GameBannerHeight < 120 or ShowBackgroundImageOnWindow=True, corner 12,12 otherwise.
    - Actions under title: dual-endcap PlayButton + Warp Ops Teal RunningActionIndicator + equal 40x40 SecondaryButton More & Edit.
    - Okudagram Framed Telemetry Dossier (GridDetailsPaneWidth=300 usable width, 2*:3* columns, GameDetailsPanePosition).
    - Empty state: Subspace Calibration Viewscreen EmptyGameTemplate centered in ViewportHeight when Game is null.
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
                                                        CornerRadius="10" Padding="2"
                                                        Background="{DynamicResource PopupBackgroundBrush}"
                                                        BorderBrush="{DynamicResource StripeBrush}" BorderThickness="1.5">
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
${indent(sidePanelCloseButton({ template: subspaceCloseTemplate, comment: '' }), 28)}
                        </Grid>
                    </Border>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;

writeOverviews(out, detailsXaml, gridXaml);
