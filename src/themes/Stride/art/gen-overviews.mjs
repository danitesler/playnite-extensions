// Generates Stride v2 DetailsViewGameOverview.xaml & GridViewGameOverview.xaml from shared overview helpers
// and applies responsive breakpoints + GameDetailsPanePosition (Left / Center / Stretch / Right).
// Usage: node src/themes/Stride/art/gen-overviews.mjs
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

// Custom 28x28 Tempered Ice-Blue Glass close plate for Grid side panel:
// Frosted glass tile with white top catchlight, steel-blue rim & compact inner shadow;
// wipes blazing Mirror's Edge Red glass + pure white IconWindowClose glyph over 120ms on hover.
const strideCloseTemplate = `<ControlTemplate TargetType="{x:Type Button}">
    <Grid Background="Transparent" SnapsToDevicePixels="True">
        <Border x:Name="Plate" Background="{DynamicResource LocalGlassButtonBrush}"
                BorderBrush="{DynamicResource LocalRimStrongBrush}" BorderThickness="1"
                CornerRadius="{DynamicResource ControlCornerRadius}">
            <Grid ClipToBounds="True">
                <Border VerticalAlignment="Top" Height="1" Background="{DynamicResource LocalWhiteBrush}"
                        Opacity="0.88" IsHitTestVisible="False" />
                <Control Template="{DynamicResource LocalCompactInsetTemplate}"
                         Foreground="{DynamicResource LocalGlassInsetBrush}" Opacity="0.16"
                         IsHitTestVisible="False" />
                <Border x:Name="HoverPlate" Background="{DynamicResource LocalCrimsonGlassBrush}" Opacity="0" IsHitTestVisible="False" />
                <ContentControl x:Name="Glyph" Width="13" Height="13" HorizontalAlignment="Center" VerticalAlignment="Center"
                                IsHitTestVisible="False" Content="{DynamicResource IconWindowClose}"
                                ContentTemplate="{DynamicResource IconTemplate}" Foreground="{DynamicResource LocalSteelInkBrush}" />
            </Grid>
        </Border>
    </Grid>
    <ControlTemplate.Triggers>
        <Trigger Property="IsMouseOver" Value="True">
            <Setter TargetName="Plate" Property="BorderBrush" Value="{DynamicResource PrimaryButtonBorderBrush}" />
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
            <Setter TargetName="HoverPlate" Property="Opacity" Value="0.84" />
        </Trigger>
    </ControlTemplate.Triggers>
</ControlTemplate>`;

const fieldOptions = {
  margin: '0,4',
  captionFontWeight: 'SemiBold',
  captionFontSize: 'FontSizeSmall',
  captionForeground: 'LocalSteelInkBrush',
  captionVerticalAlignment: 'Top',
  captionStackMargin: '0,2,0,0',
  valueOptions: { chipsMargin: '0,0,0,-5', itemsWrapPanel: true },
};

// Group break between metadata groups: 4px steel-blue hairline with leading 14px strong steel tick
// Height="4" + Margin bottom 6 = 10px; group top margin 10 = 20px total top clip for the first visible group.
const groupBreak = `<Control Template="{DynamicResource DividerTemplate}" Focusable="False" IsTabStop="False" IsHitTestVisible="False"
         Margin="0,0,0,6" />`;

// Tempered Ice-Blue Glass Metadata Dossier (300px usable inner width, velvety 4-edge inner shadow + glass sheen + red header bar)
function renderMetadataPane(widthKey) {
  const blocks = META_GROUPS.map(g => metadataGroup(g, 'stack', {
    margin: '0,10,0,0',
    padding: '0',
    borderThickness: '',
    borderBrush: '',
    beforeFields: groupBreak,
    fieldOptions,
  })).join('\n');

  return `<Border VerticalAlignment="Top" Background="{DynamicResource LocalGlassSurfaceBrush}"
        BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="1">
    <Grid ClipToBounds="True">
        <!-- Velvety 4-edge cool-blue glass inner shadow + diagonal window sheen + white top catchlight -->
        <Control Template="{DynamicResource LocalGlassInsetTemplate}"
                 Foreground="{DynamicResource LocalGlassInsetBrush}" Opacity="0.22"
                 IsHitTestVisible="False" Focusable="False" IsTabStop="False" />
        <Control Template="{DynamicResource LocalGlassSheenTemplate}"
                 Foreground="{DynamicResource LocalWhiteBrush}" Opacity="0.18"
                 IsHitTestVisible="False" Focusable="False" IsTabStop="False" />
        <Border VerticalAlignment="Top" Height="1" Background="{DynamicResource LocalWhiteBrush}"
                Opacity="0.92" IsHitTestVisible="False" />

        <StackPanel>
            <!-- Glass Dossier Header Bar -->
            <Border Height="32" Background="{DynamicResource LocalGlassHeaderBrush}"
                    BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="0,0,0,1">
                <TextBlock Text="{DynamicResource LOCGameDetails}" Margin="12,0,10,0"
                           VerticalAlignment="Center"
                           FontFamily="{DynamicResource HeadingFontFamily}" FontStyle="Italic"
                           FontSize="13.5" FontWeight="Bold"
                           Foreground="{DynamicResource LocalSteelInkBrush}" />
            </Border>

            <Border Padding="14,12,14,14">
                <StackPanel Width="{DynamicResource ${widthKey}}">
                    <Grid ClipToBounds="True">
                        <StackPanel Margin="0,-20,0,-4">
${indent(blocks, 28)}
                        </StackPanel>
                    </Grid>
                </StackPanel>
            </Border>
        </StackPanel>
    </Grid>
</Border>`;
}

// Section Heading: chunky Blazing Red '+' mark + Sora Italic Bold heading + steel-blue hairline
const sectionHeading = (loc) => `<DockPanel Margin="0,0,0,10">
    <Path DockPanel.Dock="Left" Data="{DynamicResource LocalPlusMark}" Width="9" Height="9" Stretch="Uniform"
          Fill="{DynamicResource HeadingMarkerBrush}" VerticalAlignment="Center" Margin="0,0,8,0" IsHitTestVisible="False" />
    <TextBlock DockPanel.Dock="Left" Text="{DynamicResource ${loc}}" Style="{DynamicResource HeadingTextBlock}" Margin="0,0,10,0" />
    <Border Height="1" VerticalAlignment="Center" Background="{DynamicResource HeadingRuleBrush}" IsHitTestVisible="False" />
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

// Sunlit glacial sky-mist horizon banner dissolve into PageRoot.Background with GameBannerDarken + 50% floor
const heroBanner = `<Grid x:Name="HeroArt" VerticalAlignment="Top" IsHitTestVisible="False">
${indent(heroVisibilityStyle(), 4)}
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill" />
${indent(bannerDarkeningFloor(), 4)}
    <!-- Sunlit glacial sky-mist dissolve into PageRoot.Background -->
    <Rectangle Opacity="0.34">
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                <GradientStop Color="#00000000" Offset="0.06" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="0.54" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
    <Rectangle Opacity="0.72">
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                <GradientStop Color="#00000000" Offset="0.28" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="0.76" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
    <Rectangle>
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                <GradientStop Color="#00000000" Offset="0.50" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="0.94" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
</Grid>`;

// Subtle sunlit geometric skyscraper skyline rising along the bottom of the game canvas
const skylineBackdrop = `<Control Template="{DynamicResource LocalCitySkylineTemplate}"
         Foreground="{DynamicResource LocalSkylineBrush}" Opacity="0.16"
         Height="160" VerticalAlignment="Bottom" IsHitTestVisible="False" Focusable="False" IsTabStop="False">
    <Control.Style>
        <Style TargetType="Control">
            <Style.Triggers>
                <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                    <Setter Property="Visibility" Value="Collapsed" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Control.Style>
</Control>`;

// Equal 42x42 frosted glass SecondaryButton More & Edit beside Blazing Crimson Glass PlayButton
const actionsRow = `<Grid MinWidth="172" Height="42">
    <Button x:Name="PART_ButtonPlayAction" Style="{DynamicResource PlayButton}" />
    <Button x:Name="PART_ButtonContextAction" Tag="ContextAction" Style="{DynamicResource PlayButton}" />
    <Control Style="{DynamicResource RunningActionIndicator}" />
</Grid>
<Button x:Name="PART_ButtonMoreActions" Width="42" Height="42" Padding="0" Style="{DynamicResource SecondaryButton}" Margin="8,0,0,0" ToolTip="{DynamicResource LOCMoreAction}">
    <ContentControl Content="{DynamicResource IconOptions}" ContentTemplate="{DynamicResource IconTemplate}" Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
</Button>
<Button x:Name="PART_ButtonEditGame" Width="42" Height="42" Padding="0" Style="{DynamicResource SecondaryButton}" Margin="8,0,0,0" ToolTip="{DynamicResource LOCEditGame}">
    <ContentControl Content="{DynamicResource IconEdit}" ContentTemplate="{DynamicResource IconTemplate}" Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
</Button>`;

// Squared Orbitron Bold Italic display title
const titleStack = `<TextBlock x:Name="PART_TextDisplayName" VerticalAlignment="Center" FontFamily="{DynamicResource HeadingFontFamily}"
           FontStyle="Italic" FontSize="{DynamicResource FontSizeLargest}"
           FontWeight="Bold" TextWrapping="Wrap">
    <TextBlock.Style>
        <Style TargetType="TextBlock" BasedOn="{StaticResource BaseTextBlockStyle}">
            <Setter Property="Foreground" Value="{DynamicResource TextBrush}" />
            <Style.Triggers>
                <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                    <Setter Property="Foreground" Value="{DynamicResource WindowArtForegroundBrush}" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </TextBlock.Style>
</TextBlock>`;

// Header closing rule: 1px steel-blue glass rim + 68px Blazing Mirror's Edge Red leading datum bar
const headerDatumRule = `<Grid Height="3" Margin="0,12,0,0" IsHitTestVisible="False">
    <Border Height="1" VerticalAlignment="Bottom" Background="{DynamicResource WindowPanelSeparatorBrush}" />
    <Border Width="68" Height="3" HorizontalAlignment="Left" VerticalAlignment="Bottom"
            Background="{DynamicResource GlyphBrush}" />
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
  return `<Grid Margin="0,28,0,0">
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
    Stride v2: Views/DetailsViewGameOverview.xaml (generated by art/gen-overviews.mjs).
    - Sunlit glacial sky-mist horizon hero banner (GameBannerHeight=260, spacer x * 190 / 260 floor 20) with GameBannerDarken + 50% floor.
    - Subtle sunlit architectural skyscraper silhouette (city-skyline.png) rising along the bottom edge.
    - Header: Game icon + Sora Italic Bold title (flips to WindowArtForegroundBrush over window art) + Blazing Crimson Glass
      PlayButton + RunningActionIndicator + equal 42x42 frosted glass More & Edit, closed by a steel-blue rim & red datum bar.
    - Body: SteamScreenshotsGameScope + Description/Notes beside the Tempered Ice-Blue Glass Metadata Dossier
      (GameDetailsPaneWidth=300 usable width, velvety 4-edge inner shadow, GameDetailsPanePosition Left / Center / Stretch / Right).
    - Empty state: Tempered Glass EmptyGameTemplate centered in ViewportHeight (PART_ScrollViewHost explicitly Visible).
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
${indent(skylineBackdrop, 28)}
                            <StackPanel Margin="28,0,28,28">
${indent(hideWhenNoGame('StackPanel'), 32)}
${indent(bannerSpacer('x * 190 / 260', 20, 'DetailsBannerSpacer'), 32)}
                                <StackPanel Margin="0,8,0,0">
                                    <DockPanel>
                                        <StackPanel Orientation="Horizontal" DockPanel.Dock="Right" VerticalAlignment="Center" Margin="18,0,0,0">
${indent(actionsRow, 44)}
                                        </StackPanel>
                                        <DockPanel>
                                            <Image x:Name="PART_ImageIcon" MaxWidth="44" MaxHeight="44" Margin="0,0,14,0" DockPanel.Dock="Left" VerticalAlignment="Center" />
${indent(titleStack, 44)}
                                        </DockPanel>
                                    </DockPanel>
                                </StackPanel>
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
    Stride v2: Views/GridViewGameOverview.xaml (generated by art/gen-overviews.mjs).
    - Sunlit glacial sky-mist horizon hero banner (GameBannerHeight=260, spacer x * 180 / 260 floor 14) with GameBannerDarken + 50% floor.
    - CloseGameSideBarCommand: custom 28x28 frosted ice-blue glass tile wiping blazing red on hover;
      inline sticky left of icon when GameBannerHeight < 120 or ShowBackgroundImageOnWindow=True, top-left 12,12 otherwise.
    - Actions under title: Blazing Crimson Glass PlayButton + RunningActionIndicator + equal 42x42 frosted glass More & Edit.
    - Tempered Ice-Blue Glass Metadata Dossier (GridDetailsPaneWidth=300 usable width, GameDetailsPanePosition).
    - Empty state: Tempered Glass EmptyGameTemplate centered in ViewportHeight when Game is null.
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
${indent(skylineBackdrop, 36)}
                                    <StackPanel Panel.ZIndex="2" Margin="24,0,24,26">
${indent(hideWhenNoGame('StackPanel'), 40)}
${indent(bannerSpacer('x * 180 / 260', 14, 'GridBannerSpacer'), 40)}
                                        <StackPanel Panel.ZIndex="2" Margin="0,10,0,0">
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
${indent(sidePanelCloseButton({ template: strideCloseTemplate, comment: '' }), 28)}
                        </Grid>
                    </Border>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;

writeOverviews(out, detailsXaml, gridXaml);
