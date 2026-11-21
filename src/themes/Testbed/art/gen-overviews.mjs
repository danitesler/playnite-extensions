// Generates Testbed DetailsViewGameOverview.xaml & GridViewGameOverview.xaml from shared overview helpers.
// Usage: node src/themes/Testbed/art/gen-overviews.mjs
import {
  META_GROUPS,
  bannerDarkeningFloor,
  bannerSpacer,
  heroVisibilityStyle,
  hideWhenNoGame,
  hideWhenNoTitle,
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

// Custom 28x28 cleanroom close button for Grid side panel: off-white recessed plate (#F4F6F8)
// with modular grid seams + 4-edge inset inner shadow, Thermal Crimson hover with inset shadow.
const testbedCloseTemplate = `<ControlTemplate TargetType="{x:Type Button}">
    <Grid Background="Transparent" SnapsToDevicePixels="True">
        <Border x:Name="Plate" Background="{DynamicResource PopupBackgroundBrush}"
                BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="1"
                CornerRadius="{DynamicResource ControlCornerRadius}">
            <Grid ClipToBounds="True">
                <Border x:Name="HoverPlate" Background="{DynamicResource DangerBrush}" Opacity="0" IsHitTestVisible="False" />
                <Control Template="{DynamicResource LocalPanelGridTemplate}"
                         Foreground="{DynamicResource NormalBorderBrush}" Opacity="0.16"
                         Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
                <Control x:Name="InsetShadow" Template="{DynamicResource LocalButtonInnerShadowTemplate}"
                         Foreground="{DynamicResource LocalCarbonEdgeBrush}" Opacity="0.24"
                         Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
                <ContentControl x:Name="Glyph" Width="12" Height="12" HorizontalAlignment="Center" VerticalAlignment="Center"
                                IsHitTestVisible="False" Content="{DynamicResource IconWindowClose}"
                                ContentTemplate="{DynamicResource IconTemplate}" Foreground="{DynamicResource TextBrush}" />
            </Grid>
        </Border>
    </Grid>
    <ControlTemplate.Triggers>
        <Trigger Property="IsMouseOver" Value="True">
            <Setter TargetName="Plate" Property="BorderBrush" Value="{DynamicResource SelectedBrush}" />
            <Setter TargetName="InsetShadow" Property="Opacity" Value="0.45" />
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
            <Setter TargetName="InsetShadow" Property="Opacity" Value="0.62" />
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
         Margin="0,0,0,6" Foreground="{DynamicResource GlyphBrush}" BorderBrush="{DynamicResource WindowPanelSeparatorBrush}" />`;

// Cleanroom modular dossier pane with full-width orange Details header bar. Inner ClipToBounds Grid clips the first visible group's divider (-26px top).
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
        <Control Template="{DynamicResource LocalPanelGridTemplate}"
                 Foreground="{DynamicResource NormalBorderBrush}" Opacity="0.22"
                 Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
        <Control Template="{DynamicResource LocalPanelInnerShadowTemplate}"
                 Foreground="{DynamicResource LocalCarbonEdgeBrush}" Opacity="0.22"
                 Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
        <DockPanel>
            <Border DockPanel.Dock="Top" Background="{DynamicResource LocalTagOrangeBrush}"
                    BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="0,0,0,1"
                    Padding="16,6,16,7">
                <DockPanel>
                    <TextBlock DockPanel.Dock="Left" Text="{DynamicResource LOCGameDetails}"
                               FontFamily="{DynamicResource HeadingFontFamily}"
                               FontSize="{DynamicResource FontSizeLarger}" FontWeight="Bold"
                               Foreground="{DynamicResource TextBrush}"
                               Margin="0,0,10,0" VerticalAlignment="Center" />
                    <Control Template="{DynamicResource DividerTemplate}"
                             Foreground="{DynamicResource TextBrush}"
                             BorderBrush="{DynamicResource TextBrush}"
                             VerticalAlignment="Center"
                             Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
                </DockPanel>
            </Border>
            <Border Padding="16,10,16,14">
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

const sectionHeading = (loc) => `<DockPanel Margin="0,0,0,10">
    <Border DockPanel.Dock="Left" Width="10" Height="10" Margin="0,0,8,0" VerticalAlignment="Center"
            Background="{DynamicResource SelectedBrush}" BorderBrush="{DynamicResource LocalPortalCyanBrush}" BorderThickness="1.5,1.5,0,0"
            IsHitTestVisible="False" />
    <TextBlock DockPanel.Dock="Left" Text="{DynamicResource ${loc}}" Style="{DynamicResource HeadingTextBlock}" Margin="0,0,10,0" />
    <Control Template="{DynamicResource DividerTemplate}" Foreground="{DynamicResource GlyphBrush}"
             BorderBrush="{DynamicResource WindowPanelSeparatorBrush}" VerticalAlignment="Center"
             Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
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
    </StackPanel>
    <StackPanel x:Name="PART_ElemNotes" Margin="0,20,0,0">
${indent(sectionHeading('LOCNotesLabel'), 8)}
        <TextBox x:Name="PART_TextNotes" IsReadOnly="True" TextWrapping="Wrap" Style="{DynamicResource LocalNotesTextBox}" />
    </StackPanel>
</StackPanel>`;

const wallGridLayer = `<Grid IsHitTestVisible="False" SnapsToDevicePixels="True">
    <Grid.Style>
        <Style TargetType="Grid">
            <Style.Triggers>
                <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                    <Setter Property="Visibility" Value="Collapsed" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Grid.Style>
    <Control Template="{DynamicResource LocalPanelGridTemplate}"
             Foreground="{DynamicResource NormalBorderBrush}" Opacity="0.22"
             Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
    <Control Template="{DynamicResource LocalPanelInnerShadowTemplate}"
             Foreground="{DynamicResource LocalCarbonEdgeBrush}" Opacity="0.20"
             Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
</Grid>`;

const heroBanner = `<Grid x:Name="HeroArt" VerticalAlignment="Top" IsHitTestVisible="False">
${indent(heroVisibilityStyle(), 4)}
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill" />
${indent(bannerDarkeningFloor(), 4)}
    <!-- Multi-layer S-curve fade into PageRoot.Background so banner art dissolves smoothly with zero horizontal seam -->
    <Rectangle Opacity="0.35">
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                <GradientStop Color="#00000000" Offset="0.10" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="0.58" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
    <Rectangle Opacity="0.65">
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                <GradientStop Color="#00000000" Offset="0.32" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="0.78" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
    <Rectangle>
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                <GradientStop Color="#00000000" Offset="0.56" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="0.96" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
</Grid>`;

const actionsRow = `<Grid MinWidth="176" Height="42">
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

const titleStack = `<TextBlock x:Name="PART_TextDisplayName" VerticalAlignment="Center" FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLargest}"
           FontWeight="ExtraBold" TextWrapping="Wrap">
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
</TextBlock>`;

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
    Testbed: Views/DetailsViewGameOverview.xaml (generated by art/gen-overviews.mjs).
    - Observation-bay hero banner (GameBannerHeight=300, spacer x * 236 / 300 floor 20) with GameBannerDarken + 50% floor.
    - Header: Game icon + Barlow Condensed title (flips to WindowArtForegroundBrush over window art) + Portal Blue architectural
      PlayButton + RunningActionIndicator + equal 40x40 icon-only SecondaryButton More & Edit.
    - Body: SteamScreenshotsGameScope + cleanroom Description/Notes alongside Stepped-Tab Chamber Metadata (GameDetailsPaneWidth=300
      usable width, GameDetailsPanePosition Left / Center / Stretch / Right via scripts/game-page-breakpoints.mjs).
    - Empty state: Stepped-Tab Modular Chamber Standby EmptyGameTemplate centered in ViewportHeight (PART_ScrollViewHost Visible).
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
${indent(wallGridLayer, 28)}
                            <StackPanel Margin="30,0,30,30">
${indent(hideWhenNoGame('StackPanel'), 32)}
${indent(bannerSpacer('x * 236 / 300', 20, 'DetailsBannerSpacer'), 32)}
                                <DockPanel Margin="0,10,0,16">
                                    <StackPanel Orientation="Horizontal" DockPanel.Dock="Right" VerticalAlignment="Center" Margin="18,0,0,0">
${indent(actionsRow, 40)}
                                    </StackPanel>
                                    <DockPanel>
                                        <Image x:Name="PART_ImageIcon" MaxWidth="46" MaxHeight="46" Margin="0,0,14,0" DockPanel.Dock="Left" VerticalAlignment="Center" />
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
    Testbed: Views/GridViewGameOverview.xaml (generated by art/gen-overviews.mjs).
    - Observation-bay hero banner (GameBannerHeight=300, spacer x * 220 / 300 floor 14) with GameBannerDarken + 50% floor.
    - CloseGameSideBarCommand: custom 28x28 white chamber hatch with 2px bevel lip, 3x3 Portal Blue pip, and Thermal Crimson hover;
      inline sticky left of icon when GameBannerHeight < 120 or ShowBackgroundImageOnWindow=True, corner 12,12 otherwise.
    - Actions under title: PlayButton + RunningActionIndicator + equal 40x40 SecondaryButton More & Edit.
    - Stepped-Tab Chamber Metadata (GridDetailsPaneWidth=300 usable width, 2*:3* columns, GameDetailsPanePosition).
    - Empty state: Stepped-Tab Chamber Standby EmptyGameTemplate centered in ViewportHeight when Game is null.
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
${indent(wallGridLayer, 36)}
                                    <StackPanel Panel.ZIndex="2" Margin="24,0,24,26">
${indent(hideWhenNoGame('StackPanel'), 40)}
${indent(bannerSpacer('x * 220 / 300', 14, 'GridBannerSpacer'), 40)}
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
${indent(renderTwoColumnBody('GridDetailsPaneWidth'), 40)}
                                    </StackPanel>
${indent(emptyState, 36)}
                                </Grid>
                            </ScrollViewer>
${indent(sidePanelCloseButton({ template: testbedCloseTemplate, comment: '' }), 28)}
                        </Grid>
                    </Border>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;

writeOverviews(out, detailsXaml, gridXaml);
