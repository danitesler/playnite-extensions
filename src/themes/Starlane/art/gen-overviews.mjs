// Generates Starlane Views/DetailsViewGameOverview.xaml & Views/GridViewGameOverview.xaml.
// Usage: node src/themes/Starlane/art/gen-overviews.mjs
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

// Custom 28x28 minimalist OLED close hatch: dark hairline square igniting Sith Red Lightsaber on hover.
const starlaneCloseTemplate = `<ControlTemplate TargetType="{x:Type Button}">
    <Grid Background="Transparent" SnapsToDevicePixels="True">
        <Border x:Name="Plate" Background="{DynamicResource PopupBackgroundBrush}"
                BorderBrush="{DynamicResource FrameBrush}" BorderThickness="1"
                CornerRadius="{DynamicResource ControlCornerRadius}">
            <Grid ClipToBounds="True">
                <Border x:Name="HoverPlate" Background="{DynamicResource DangerBrush}"
                        Opacity="0" IsHitTestVisible="False" />
                <Rectangle x:Name="HoverRim" Height="1.5" VerticalAlignment="Top"
                           Fill="{DynamicResource LocalWhiteCoreBrush}" Opacity="0" IsHitTestVisible="False" />
                <ContentControl x:Name="Glyph" Width="14" Height="14"
                                HorizontalAlignment="Center" VerticalAlignment="Center"
                                IsHitTestVisible="False" Content="{DynamicResource IconWindowClose}"
                                ContentTemplate="{DynamicResource IconTemplate}"
                                Foreground="{DynamicResource TextBrush}" />
            </Grid>
        </Border>
    </Grid>
    <ControlTemplate.Triggers>
        <Trigger Property="IsMouseOver" Value="True">
            <Setter TargetName="Plate" Property="BorderBrush" Value="{DynamicResource LocalWhiteCoreBrush}" />
            <Setter TargetName="Glyph" Property="Foreground" Value="{DynamicResource DangerForegroundBrush}" />
            <Trigger.EnterActions>
                <BeginStoryboard><Storyboard>
                    <DoubleAnimation Storyboard.TargetName="HoverPlate" Storyboard.TargetProperty="Opacity" To="1" Duration="0:0:0.12" />
                    <DoubleAnimation Storyboard.TargetName="HoverRim" Storyboard.TargetProperty="Opacity" To="1" Duration="0:0:0.12" />
                </Storyboard></BeginStoryboard>
            </Trigger.EnterActions>
            <Trigger.ExitActions>
                <BeginStoryboard><Storyboard>
                    <DoubleAnimation FillBehavior="Stop" Storyboard.TargetName="HoverPlate" Storyboard.TargetProperty="Opacity" To="0" Duration="0:0:0.15" />
                    <DoubleAnimation FillBehavior="Stop" Storyboard.TargetName="HoverRim" Storyboard.TargetProperty="Opacity" To="0" Duration="0:0:0.15" />
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
  valueOptions: { chipsMargin: '0,0,0,-4', itemsWrapPanel: true, chipStyle: 'LocalPropertyTagButton' },
};

// Minimalist hairline break led by a 14x2 Crawl-Yellow spark
const groupBreak = `<Control Template="{DynamicResource DividerTemplate}" Focusable="False" IsTabStop="False" IsHitTestVisible="False"
         Margin="0,0,0,6" />`;

// Borderless Minimalist OLED Metadata Ledger (left 1px whisper hairline, zero heavy card box)
function renderMetadataPane(widthKey) {
  const blocks = META_GROUPS.map(g => metadataGroup(g, 'stack', {
    margin: '0,10,0,0',
    padding: '0',
    borderThickness: '',
    borderBrush: '',
    beforeFields: groupBreak,
    fieldOptions,
  })).join('\n');

  return `<Border VerticalAlignment="Top" BorderBrush="{DynamicResource PanelSeparatorBrush}" BorderThickness="1,0,0,0"
        Padding="20,2,0,4" SnapsToDevicePixels="True">
    <StackPanel Width="{DynamicResource ${widthKey}}">
        <Grid ClipToBounds="True">
            <StackPanel Margin="0,-26,0,-4">
${indent(blocks, 16)}
            </StackPanel>
        </Grid>
    </StackPanel>
</Border>`;
}

const sectionHeading = (loc, saberBrush = 'LocalSaberBlueBrush') => `<DockPanel Margin="0,0,0,10">
    <Grid DockPanel.Dock="Left" Width="18" Height="10" Margin="0,0,8,0" VerticalAlignment="Center" IsHitTestVisible="False">
        <Rectangle Fill="{DynamicResource ${saberBrush}}" Opacity="0.92" OpacityMask="{DynamicResource LocalSaberBeamHMaskBrush}" />
        <Rectangle Height="2" Margin="2,0" VerticalAlignment="Center" Fill="{DynamicResource LocalWhiteCoreBrush}" />
    </Grid>
    <TextBlock DockPanel.Dock="Left" Text="{DynamicResource ${loc}}" Style="{DynamicResource HeadingTextBlock}" Margin="0,0,12,0" VerticalAlignment="Center" />
    <Rectangle Height="1" VerticalAlignment="Center" Fill="{DynamicResource HeadingRuleBrush}" IsHitTestVisible="False" />
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
${indent(sectionHeading('LOCGameDescriptionTitle', 'LocalSaberGreenBrush'), 8)}
        <HtmlTextView x:Name="PART_HtmlDescription" HtmlFontFamily="{DynamicResource FontFamily}" HtmlFontSize="{DynamicResource FontSize}"
                      TextElement.Foreground="{DynamicResource TextBrush}"
                      Tag="{DynamicResource LinkBrush}"
                      HtmlForeground="{Binding Path=(TextElement.Foreground).Color, RelativeSource={RelativeSource Self}}"
                      LinkForeground="{Binding Tag.Color, RelativeSource={RelativeSource Self}}" />
    </StackPanel>
    <StackPanel x:Name="PART_ElemNotes" Margin="0,20,0,0">
${indent(sectionHeading('LOCNotesLabel', 'LocalSaberBlueBrush'), 8)}
        <TextBox x:Name="PART_TextNotes" IsReadOnly="True" TextWrapping="Wrap" Style="{DynamicResource LocalNotesTextBox}" />
    </StackPanel>
</StackPanel>`;

const heroBanner = `<Grid x:Name="HeroArt" VerticalAlignment="Top" IsHitTestVisible="False">
${indent(heroVisibilityStyle(), 4)}
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill" />
${indent(bannerDarkeningFloor(), 4)}
    <!-- Deep-space OLED fade seamlessly into #000000 -->
    <Rectangle>
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                <GradientStop Color="#20000000" Offset="0" />
                <GradientStop Color="#88000000" Offset="0.54" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
</Grid>`;

const actionsRow = `<Grid MinWidth="156" Height="40">
    <Button x:Name="PART_ButtonPlayAction" Style="{DynamicResource PlayButton}" />
    <Button x:Name="PART_ButtonContextAction" Tag="ContextAction" Style="{DynamicResource PlayButton}" />
    <Control Style="{DynamicResource RunningActionIndicator}" />
</Grid>
<Button x:Name="PART_ButtonMoreActions" Width="36" Height="36" Padding="0" Style="{DynamicResource SecondaryButton}" Margin="8,0,0,0" ToolTip="{DynamicResource LOCMoreAction}">
    <ContentControl Content="{DynamicResource IconOptions}" ContentTemplate="{DynamicResource IconTemplate}" Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
</Button>
<Button x:Name="PART_ButtonEditGame" Width="36" Height="36" Padding="0" Style="{DynamicResource SecondaryButton}" Margin="6,0,0,0" ToolTip="{DynamicResource LOCEditGame}">
    <ContentControl Content="{DynamicResource IconEdit}" ContentTemplate="{DynamicResource IconTemplate}" Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
</Button>`;

// Iconic Hollow-Yellow Outlined Star Wars Opening Title:
// PART_TextDisplayName stays Visible in #000000 core right above 8 crisp #FFE81F outline copies!
const titleStack = `<Grid VerticalAlignment="Center">
    <TextBlock Text="{Binding Text, ElementName=PART_TextDisplayName}" FontFamily="{DynamicResource PosterFontFamily}" FontSize="{DynamicResource FontSizeLargest}" FontWeight="Bold" Foreground="{DynamicResource TextOutlineBrush}" TextWrapping="Wrap" IsHitTestVisible="False"><TextBlock.RenderTransform><TranslateTransform X="-1.6" Y="0" /></TextBlock.RenderTransform></TextBlock>
    <TextBlock Text="{Binding Text, ElementName=PART_TextDisplayName}" FontFamily="{DynamicResource PosterFontFamily}" FontSize="{DynamicResource FontSizeLargest}" FontWeight="Bold" Foreground="{DynamicResource TextOutlineBrush}" TextWrapping="Wrap" IsHitTestVisible="False"><TextBlock.RenderTransform><TranslateTransform X="1.6" Y="0" /></TextBlock.RenderTransform></TextBlock>
    <TextBlock Text="{Binding Text, ElementName=PART_TextDisplayName}" FontFamily="{DynamicResource PosterFontFamily}" FontSize="{DynamicResource FontSizeLargest}" FontWeight="Bold" Foreground="{DynamicResource TextOutlineBrush}" TextWrapping="Wrap" IsHitTestVisible="False"><TextBlock.RenderTransform><TranslateTransform X="0" Y="-1.6" /></TextBlock.RenderTransform></TextBlock>
    <TextBlock Text="{Binding Text, ElementName=PART_TextDisplayName}" FontFamily="{DynamicResource PosterFontFamily}" FontSize="{DynamicResource FontSizeLargest}" FontWeight="Bold" Foreground="{DynamicResource TextOutlineBrush}" TextWrapping="Wrap" IsHitTestVisible="False"><TextBlock.RenderTransform><TranslateTransform X="0" Y="1.6" /></TextBlock.RenderTransform></TextBlock>
    <TextBlock Text="{Binding Text, ElementName=PART_TextDisplayName}" FontFamily="{DynamicResource PosterFontFamily}" FontSize="{DynamicResource FontSizeLargest}" FontWeight="Bold" Foreground="{DynamicResource TextOutlineBrush}" TextWrapping="Wrap" IsHitTestVisible="False"><TextBlock.RenderTransform><TranslateTransform X="-1.2" Y="-1.2" /></TextBlock.RenderTransform></TextBlock>
    <TextBlock Text="{Binding Text, ElementName=PART_TextDisplayName}" FontFamily="{DynamicResource PosterFontFamily}" FontSize="{DynamicResource FontSizeLargest}" FontWeight="Bold" Foreground="{DynamicResource TextOutlineBrush}" TextWrapping="Wrap" IsHitTestVisible="False"><TextBlock.RenderTransform><TranslateTransform X="1.2" Y="-1.2" /></TextBlock.RenderTransform></TextBlock>
    <TextBlock Text="{Binding Text, ElementName=PART_TextDisplayName}" FontFamily="{DynamicResource PosterFontFamily}" FontSize="{DynamicResource FontSizeLargest}" FontWeight="Bold" Foreground="{DynamicResource TextOutlineBrush}" TextWrapping="Wrap" IsHitTestVisible="False"><TextBlock.RenderTransform><TranslateTransform X="-1.2" Y="1.2" /></TextBlock.RenderTransform></TextBlock>
    <TextBlock Text="{Binding Text, ElementName=PART_TextDisplayName}" FontFamily="{DynamicResource PosterFontFamily}" FontSize="{DynamicResource FontSizeLargest}" FontWeight="Bold" Foreground="{DynamicResource TextOutlineBrush}" TextWrapping="Wrap" IsHitTestVisible="False"><TextBlock.RenderTransform><TranslateTransform X="1.2" Y="1.2" /></TextBlock.RenderTransform></TextBlock>
    <TextBlock x:Name="PART_TextDisplayName" VerticalAlignment="Center"
               FontFamily="{DynamicResource PosterFontFamily}" FontSize="{DynamicResource FontSizeLargest}" FontWeight="Bold"
               Foreground="{DynamicResource WindowBackgourndBrush}" TextWrapping="Wrap" />
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
    Starlane: Views/DetailsViewGameOverview.xaml (generated by art/gen-overviews.mjs).
    Minimalist OLED #000000 space + subtle starfield, hollow-yellow outlined Star Wars movie title
    (Unbounded Bold #FFE81F outline over #000000 core), glowing Blue/Green/Red Lightsaber PlayButton,
    SteamScreenshotsGameScope, and borderless OLED metadata ledger with GameDetailsPanePosition breakpoints.
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
                            <Rectangle x:Name="PageStars" Fill="{DynamicResource TextBrush}" Opacity="0.36"
                                       OpacityMask="{DynamicResource LocalStarfieldMaskBrush}" IsHitTestVisible="False">
                                <Rectangle.Style>
                                    <Style TargetType="Rectangle">
                                        <Style.Triggers>
                                            <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                                                <Setter Property="Visibility" Value="Collapsed" />
                                            </DataTrigger>
                                        </Style.Triggers>
                                    </Style>
                                </Rectangle.Style>
                            </Rectangle>
${indent(heroBanner, 28)}
                            <StackPanel Margin="30,0,30,28">
${indent(hideWhenNoGame('StackPanel'), 32)}
${indent(bannerSpacer('x * 192 / 280', 18, 'DetailsBannerSpacer'), 32)}
                                <Border BorderBrush="{DynamicResource PanelSeparatorBrush}" BorderThickness="0,0,0,1" Padding="0,8,0,16">
                                    <DockPanel>
                                        <StackPanel Orientation="Horizontal" DockPanel.Dock="Right" VerticalAlignment="Center" Margin="20,0,0,0">
${indent(actionsRow, 44)}
                                        </StackPanel>
                                        <DockPanel>
                                            <Border DockPanel.Dock="Left" VerticalAlignment="Center" Margin="0,0,14,0"
                                                    Visibility="{Binding Visibility, ElementName=PART_ImageIcon}"
                                                    CornerRadius="3" Padding="2"
                                                    Background="{DynamicResource PopupBackgroundBrush}"
                                                    BorderBrush="{DynamicResource PanelSeparatorBrush}" BorderThickness="1">
                                                <Image x:Name="PART_ImageIcon" MaxWidth="42" MaxHeight="42" />
                                            </Border>
${indent(titleStack, 44)}
                                        </DockPanel>
                                    </DockPanel>
                                </Border>
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
    Starlane: Views/GridViewGameOverview.xaml (generated by art/gen-overviews.mjs).
    Minimalist OLED grid side panel with custom 28x28 Sith-Red-hover close hatch, hollow-yellow
    outlined Star Wars game title, glowing Lightsaber PlayButton, SteamScreenshotsGameScope,
    borderless OLED metadata ledger, and centered starfield empty state.
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
                                    <Rectangle x:Name="PageStars" Fill="{DynamicResource TextBrush}" Opacity="0.34"
                                               OpacityMask="{DynamicResource LocalStarfieldMaskBrush}" IsHitTestVisible="False">
                                        <Rectangle.Style>
                                            <Style TargetType="Rectangle">
                                                <Style.Triggers>
                                                    <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                                                        <Setter Property="Visibility" Value="Collapsed" />
                                                    </DataTrigger>
                                                </Style.Triggers>
                                            </Style>
                                        </Rectangle.Style>
                                    </Rectangle>
${indent(heroBanner, 36)}
                                    <StackPanel Panel.ZIndex="2" Margin="24,0,24,26">
${indent(hideWhenNoGame('StackPanel'), 40)}
${indent(bannerSpacer('x * 184 / 280', 14, 'GridBannerSpacer'), 40)}
                                        <Border Panel.ZIndex="2" BorderBrush="{DynamicResource PanelSeparatorBrush}" BorderThickness="0,0,0,1" Padding="0,8,0,14">
                                            <StackPanel Panel.ZIndex="2">
                                                <DockPanel Panel.ZIndex="2">
${indent(inlineCloseButton(), 52)}
                                                    <Border DockPanel.Dock="Left" VerticalAlignment="Center" Margin="0,0,12,0"
                                                            Visibility="{Binding Visibility, ElementName=PART_ImageIcon}"
                                                            CornerRadius="3" Padding="2"
                                                            Background="{DynamicResource PopupBackgroundBrush}"
                                                            BorderBrush="{DynamicResource PanelSeparatorBrush}" BorderThickness="1">
                                                        <Image x:Name="PART_ImageIcon" MaxWidth="40" MaxHeight="40" />
                                                    </Border>
${indent(titleStack, 52)}
                                                </DockPanel>
                                                <StackPanel Orientation="Horizontal" Margin="0,12,0,0">
${indent(actionsRow, 52)}
                                                </StackPanel>
                                            </StackPanel>
                                        </Border>
${indent(renderTwoColumnBody('GridDetailsPaneWidth'), 40)}
                                    </StackPanel>
${indent(emptyState, 36)}
                                </Grid>
                            </ScrollViewer>
${indent(sidePanelCloseButton({ template: starlaneCloseTemplate, comment: '' }), 28)}
                        </Grid>
                    </Border>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;

writeOverviews(out, detailsXaml, gridXaml);
