#!/usr/bin/env node
// Generates Guiding Wind's DetailsViewGameOverview.xaml and GridViewGameOverview.xaml from a single template.
// Light misty-washi reading canvas with atmospheric hero scrim, sumi-e brush-stroke section banners,
// dark Sayagata lacquer metadata inspector card (Parchment* + antique gold links/labels + 6 Meta* groups),
// proportional banner spacer, responsive breakpoint columns, SteamScreenshots eligibility gate, and EmptyGameTemplate.

import {
  META_GROUPS,
  bannerSpacer,
  collapseEmptyTrigger,
  hideWhenNoTitle,
  indent,
  metadataValue,
  resolveThemeSrcDir,
  writeOverviews,
} from '../../../../scripts/overview-generator.mjs';

const srcDir = resolveThemeSrcDir(import.meta.url);

// Dark Sayagata lacquer card: re-map plain text values to ParchmentTextBrush (#f2f1ed) for AAA contrast on #141414.
function darkCardValue(kind, part, extra = '') {
  return metadataValue(kind, part, extra).replace(
    /Foreground="\{DynamicResource TextBrush\}"/g,
    'Foreground="{DynamicResource ParchmentTextBrush}"',
  );
}

// Meta group card divider + 2-column property rows
function renderMetaGroups() {
  return META_GROUPS.map(([groupName, items], idx) => {
    const topMargin = idx === 0 ? '0' : '8';
    const topBorder = idx === 0 ? '' : '\n    <Border Height="1" Background="{DynamicResource FrameInnerBrush}" Margin="0,0,0,8" />';
    const rows = items.map(([suffix, locKey, kind, part]) => {
      const elem = `PART_Elem${suffix}`;
      const val = indent(darkCardValue(kind, part), 8);
      return `<Grid x:Name="${elem}" Margin="0,3">
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="Auto" SharedSizeGroup="MetaLabels" />
        <ColumnDefinition Width="12" />
        <ColumnDefinition Width="*" />
    </Grid.ColumnDefinitions>
    <TextBlock Grid.Column="0" Text="{DynamicResource ${locKey}}"
               Foreground="{DynamicResource ParchmentLabelBrush}"
               FontSize="{DynamicResource FontSizeSmall}"
               VerticalAlignment="Top" Margin="0,2,0,0"
               TextTrimming="CharacterEllipsis" MaxWidth="108" />
    <Grid Grid.Column="2" VerticalAlignment="Center">
${val}
    </Grid>
</Grid>`;
    }).join('\n');

    const elemNames = items.map(([suffix]) => `PART_Elem${suffix}`);
    return `<StackPanel x:Name="${groupName}" Margin="0,${topMargin},0,0">
${indent(collapseEmptyTrigger(elemNames), 4)}${topBorder}
${indent(rows, 4)}
</StackPanel>`;
  }).join('\n');
}

// Sumi-e brush-stroke header banner (matching preview-details.html sec-banner & GroupBox)
function sectionBanner(locKey, margin = '0,0,0,12') {
  return `<Grid Margin="${margin}" HorizontalAlignment="Left" MinHeight="28" MinWidth="220">
    <Rectangle Fill="{DynamicResource HeaderBandBrush}" IsHitTestVisible="False">
        <Rectangle.OpacityMask>
            <ImageBrush ImageSource="{ThemeFile 'Images/fx/brush-banner-r.png'}" Stretch="Fill" />
        </Rectangle.OpacityMask>
    </Rectangle>
    <StackPanel Orientation="Horizontal" Margin="12,5,38,5" VerticalAlignment="Center">
        <Path Width="6" Height="6" Margin="0,0,8,0" VerticalAlignment="Center"
              Stretch="Fill" Data="M3,0 L6,3 L3,6 L0,3 Z"
              Fill="{DynamicResource HeadingMarkerBrush}" IsHitTestVisible="False" />
        <TextBlock VerticalAlignment="Center">
            <ContentPresenter Content="{DynamicResource ${locKey}}">
                <ContentPresenter.Resources>
                    <DataTemplate DataType="{x:Type sys:String}">
                        <TextBlock Text="{Binding Converter={StaticResource StringToUpperCaseConverter}}"
                                   FontFamily="{DynamicResource HeadingFontFamily}"
                                   FontSize="{DynamicResource FontSizeSmall}"
                                   FontWeight="SemiBold"
                                   Foreground="{DynamicResource HeaderBandForegroundBrush}" />
                    </DataTemplate>
                </ContentPresenter.Resources>
            </ContentPresenter>
        </TextBlock>
    </StackPanel>
</Grid>`;
}

// Square Sayagata keycap style for More & Edit icon-only secondary buttons (equal 40x40 sizing)
const squareKeycapStyle = `<Style TargetType="Button" BasedOn="{StaticResource {x:Type Button}}">
    <Setter Property="Width" Value="40" />
    <Setter Property="Height" Value="40" />
    <Setter Property="MinWidth" Value="40" />
    <Setter Property="MinHeight" Value="40" />
    <Setter Property="Padding" Value="0" />
    <Setter Property="Cursor" Value="Hand" />
    <Setter Property="Foreground" Value="{DynamicResource WindowArtForegroundBrush}" />
    <Setter Property="Background" Value="{DynamicResource SecondaryButtonBackgroundBrush}" />
    <Setter Property="BorderBrush" Value="{DynamicResource SecondaryButtonBorderBrush}" />
    <Setter Property="Template">
        <Setter.Value>
            <ControlTemplate TargetType="Button">
                <Grid Background="Transparent" SnapsToDevicePixels="True">
                    <Border x:Name="Plate"
                            Background="{TemplateBinding Background}"
                            BorderBrush="{TemplateBinding BorderBrush}"
                            BorderThickness="1"
                            CornerRadius="{DynamicResource ControlCornerRadius}" />
                    <Border x:Name="HoverPlate"
                            Background="{DynamicResource SecondaryButtonHoverBackgroundBrush}"
                            BorderBrush="{DynamicResource FrameHoverBrush}"
                            BorderThickness="1"
                            CornerRadius="{DynamicResource ControlCornerRadius}"
                            Opacity="0" IsHitTestVisible="False" />
                    <ContentPresenter HorizontalAlignment="Center" VerticalAlignment="Center" />
                </Grid>
                <ControlTemplate.Triggers>
                    <Trigger Property="IsMouseOver" Value="True">
                        <Setter TargetName="HoverPlate" Property="Opacity" Value="1" />
                    </Trigger>
                    <Trigger Property="IsPressed" Value="True">
                        <Setter TargetName="Plate" Property="Background" Value="{DynamicResource SecondaryButtonPressedBackgroundBrush}" />
                    </Trigger>
                </ControlTemplate.Triggers>
            </ControlTemplate>
        </Setter.Value>
    </Setter>
</Style>`;

// Light-theme HtmlTextView description/notes styling (switches cleanly on ShowBackgroundImageOnWindow=True)
const htmlTextStyle = `<Style TargetType="HtmlTextView">
    <Setter Property="HtmlFontFamily" Value="{DynamicResource FontFamily}" />
    <Setter Property="HtmlFontSize" Value="{DynamicResource FontSize}" />
    <Setter Property="TextElement.Foreground" Value="{DynamicResource TextBrush}" />
    <Setter Property="Tag" Value="{DynamicResource LinkBrush}" />
    <Setter Property="HtmlForeground" Value="{Binding Path=(TextElement.Foreground).Color, RelativeSource={RelativeSource Self}}" />
    <Setter Property="LinkForeground" Value="{Binding Tag.Color, RelativeSource={RelativeSource Self}}" />
    <Style.Triggers>
        <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
            <Setter Property="TextElement.Foreground" Value="{DynamicResource WindowArtForegroundBrush}" />
            <Setter Property="Tag" Value="{DynamicResource ParchmentLinkBrush}" />
        </DataTrigger>
    </Style.Triggers>
</Style>`;

function buildOverview(kind) {
  const isGrid = kind === 'Grid';
  const typeName = isGrid ? 'GridViewGameOverview' : 'DetailsViewGameOverview';
  const prefix = kind;
  const paneWidthKey = isGrid ? 'GridDetailsPaneWidth' : 'GameDetailsPaneWidth';
  const spacerFallback = isGrid ? 14 : 18;
  const pageMargin = isGrid ? '24,0,24,26' : '28,0,28,28';

  const closeButtonInline = isGrid ? `
                                                <Button x:Name="InlineSidePanelCloseButton" DockPanel.Dock="Left" HorizontalAlignment="Left" VerticalAlignment="Center"
                                                        Margin="0,0,10,0" Width="28" Height="28" Padding="0" Focusable="False" Cursor="Hand"
                                                        ToolTip="{DynamicResource LOCCloseLabel}" Command="{MainViewModel CloseGameSideBarCommand}"
                                                        Template="{Binding Template, ElementName=SidePanelCloseButton}">
                                                    <Button.Style>
                                                        <Style TargetType="Button" BasedOn="{StaticResource {x:Type Button}}">
                                                            <Setter Property="Visibility" Value="{Binding Tag, ElementName=SidePanelCloseButton, Converter={StaticResource MathConverter}, ConverterParameter='x &lt; 120 ? \`Visible\` : \`Collapsed\`'}" />
                                                            <Style.Triggers>
                                                                <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                                                                    <Setter Property="Visibility" Value="Visible" />
                                                                </DataTrigger>
                                                            </Style.Triggers>
                                                        </Style>
                                                    </Button.Style>
                                                    <Button.RenderTransform>
                                                        <TranslateTransform Y="{Binding ContentVerticalOffset, ElementName=PART_ScrollViewHost}" />
                                                    </Button.RenderTransform>
                                                </Button>` : '';

  const sidePanelCloseCorner = isGrid ? `
                            <Button x:Name="SidePanelCloseButton" Tag="{DynamicResource GameBannerHeight}"
                                    HorizontalAlignment="Left" VerticalAlignment="Top" Margin="12,12,0,0" Width="28" Height="28" Padding="0"
                                    Focusable="False" Cursor="Hand" ToolTip="{DynamicResource LOCCloseLabel}"
                                    Command="{MainViewModel CloseGameSideBarCommand}">
                                <Button.Style>
                                    <Style TargetType="Button" BasedOn="{StaticResource {x:Type Button}}">
                                        <Setter Property="Visibility" Value="{Binding Tag, RelativeSource={RelativeSource Self}, Converter={StaticResource MathConverter}, ConverterParameter='x &lt; 120 ? \`Collapsed\` : \`Visible\`'}" />
                                        <Style.Triggers>
                                            <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                                                <Setter Property="Visibility" Value="Collapsed" />
                                            </DataTrigger>
                                            <DataTrigger Binding="{Binding Game, FallbackValue={x:Null}}" Value="{x:Null}">
                                                <Setter Property="Visibility" Value="Visible" />
                                            </DataTrigger>
                                        </Style.Triggers>
                                    </Style>
                                </Button.Style>
                                <Button.Template>
                                    <ControlTemplate TargetType="{x:Type Button}">
                                        <Grid Background="Transparent">
                                            <Border CornerRadius="{DynamicResource ControlCornerRadius}" Background="{DynamicResource SecondaryButtonBackgroundBrush}"
                                                    BorderBrush="{DynamicResource SecondaryButtonBorderBrush}" BorderThickness="1" IsHitTestVisible="False" />
                                            <Border x:Name="HoverPlate" CornerRadius="{DynamicResource ControlCornerRadius}" Background="{DynamicResource DangerBrush}" Opacity="0" IsHitTestVisible="False" />
                                            <ContentControl x:Name="Glyph" Width="14" Height="14" HorizontalAlignment="Center" VerticalAlignment="Center" IsHitTestVisible="False"
                                                            Content="{DynamicResource IconWindowClose}" ContentTemplate="{DynamicResource IconTemplate}"
                                                            Foreground="{DynamicResource WindowArtForegroundBrush}" />
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
                                                    <BeginStoryboard><Storyboard FillBehavior="Stop">
                                                        <DoubleAnimation Storyboard.TargetName="HoverPlate" Storyboard.TargetProperty="Opacity" To="0" Duration="0:0:0.2" />
                                                    </Storyboard></BeginStoryboard>
                                                </Trigger.ExitActions>
                                            </Trigger>
                                            <Trigger Property="IsPressed" Value="True">
                                                <Setter TargetName="HoverPlate" Property="Opacity" Value="0.7" />
                                            </Trigger>
                                        </ControlTemplate.Triggers>
                                    </ControlTemplate>
                                </Button.Template>
                            </Button>` : '';

  const coreGrid = `<Grid>
                            <ScrollViewer CanContentScroll="False" x:Name="PART_ScrollViewHost" HorizontalScrollBarVisibility="Disabled" VerticalScrollBarVisibility="Visible"${isGrid ? '' : ' Visibility="Visible"'}>
                                <Grid x:Name="PageRoot" UseLayoutRounding="True">
                                    <Grid.Style>
                                        <Style TargetType="Grid">
                                            <Setter Property="Background" Value="{DynamicResource GameOverviewBackgroundBrush}" />
                                            <Style.Triggers>
                                                <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                                                    <Setter Property="Background" Value="Transparent" />
                                                </DataTrigger>
                                            </Style.Triggers>
                                        </Style>
                                    </Grid.Style>

                                    <Control Template="{DynamicResource GrainTemplate}" Foreground="{DynamicResource HeadingForegroundBrush}"
                                             Opacity="0.03" IsHitTestVisible="False" Focusable="False" />

                                    <Grid x:Name="HeroArt" VerticalAlignment="Top" IsHitTestVisible="False">
                                        <Grid.Style>
                                            <Style TargetType="Grid">
                                                <Setter Property="Height" Value="{DynamicResource GameBannerHeight}" />
                                                <Style.Triggers>
                                                    <DataTrigger Binding="{Binding Visibility, ElementName=PART_ImageBackground}" Value="Collapsed">
                                                        <Setter Property="Height" Value="0" />
                                                    </DataTrigger>
                                                    <DataTrigger Binding="{Binding Source, ElementName=PART_ImageBackground}" Value="{x:Null}">
                                                        <Setter Property="Height" Value="0" />
                                                    </DataTrigger>
                                                    <DataTrigger Binding="{Binding Game.BackgroundImage}" Value="{x:Null}">
                                                        <Setter Property="Height" Value="0" />
                                                    </DataTrigger>
                                                    <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                                                        <Setter Property="Visibility" Value="Collapsed" />
                                                    </DataTrigger>
                                                </Style.Triggers>
                                            </Style>
                                        </Grid.Style>
                                        <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill" />
                                        <Rectangle Fill="{DynamicResource GameBannerTintBrush}" Opacity="{DynamicResource GameBannerDarken}" IsHitTestVisible="False" />
                                        <Rectangle Fill="{DynamicResource GameBannerTintBrush}" Opacity="0.5" Tag="{DynamicResource GameBannerDarken}" IsHitTestVisible="False">
                                            <Rectangle.Style>
                                                <Style TargetType="Rectangle">
                                                    <Style.Triggers>
                                                        <DataTrigger Binding="{Binding Tag, RelativeSource={RelativeSource Self}}" Value="0">
                                                            <Setter Property="Visibility" Value="Collapsed" />
                                                        </DataTrigger>
                                                    </Style.Triggers>
                                                </Style>
                                            </Rectangle.Style>
                                        </Rectangle>
                                        <Rectangle Height="90" VerticalAlignment="Top" Opacity="0.45">
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
                                                    <GradientStop Color="#00000000" Offset="0.22" />
                                                    <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="1" />
                                                </LinearGradientBrush>
                                            </Rectangle.Fill>
                                        </Rectangle>
                                    </Grid>

                                    <StackPanel Panel.ZIndex="2" Margin="${pageMargin}">
                                        <StackPanel.Style>
                                            <Style TargetType="StackPanel">
                                                <Style.Triggers>
                                                    <DataTrigger Binding="{Binding Game, FallbackValue={x:Null}}" Value="{x:Null}">
                                                        <Setter Property="Visibility" Value="Collapsed" />
                                                    </DataTrigger>
                                                </Style.Triggers>
                                            </Style>
                                        </StackPanel.Style>

${indent(bannerSpacer('x * 112 / 268', spacerFallback), 40)}

                                        <StackPanel Panel.ZIndex="2" Margin="0,10,0,14">
                                            <DockPanel Panel.ZIndex="2">${closeButtonInline}
                                                <Image x:Name="PART_ImageIcon" MaxWidth="44" MaxHeight="44" Margin="0,0,14,0" DockPanel.Dock="Left" VerticalAlignment="Center" />
                                                <StackPanel VerticalAlignment="Center">
                                                    <Grid VerticalAlignment="Center">
                                                        <TextBlock x:Name="PART_TextDisplayName" FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLargest}" FontWeight="Bold"
                                                                   Foreground="Transparent" TextWrapping="Wrap" />
                                                        <TextBlock Text="{Binding Text, ElementName=PART_TextDisplayName, Converter={StaticResource StringToUpperCaseConverter}}"
                                                                   FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLargest}" FontWeight="Bold"
                                                                   TextWrapping="Wrap" IsHitTestVisible="False">
                                                            <TextBlock.Style>
                                                                <Style TargetType="TextBlock">
                                                                    <Setter Property="Foreground" Value="{DynamicResource HeadingForegroundBrush}" />
                                                                    <Style.Triggers>
                                                                        <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                                                                            <Setter Property="Foreground" Value="{DynamicResource WindowArtForegroundBrush}" />
                                                                        </DataTrigger>
                                                                        <DataTrigger Binding="{Binding Text, ElementName=PART_TextDisplayName}" Value="">
                                                                            <Setter Property="Visibility" Value="Collapsed" />
                                                                        </DataTrigger>
                                                                        <DataTrigger Binding="{Binding Text, ElementName=PART_TextDisplayName}" Value="{x:Null}">
                                                                            <Setter Property="Visibility" Value="Collapsed" />
                                                                        </DataTrigger>
                                                                    </Style.Triggers>
                                                                </Style>
                                                            </TextBlock.Style>
                                                        </TextBlock>
                                                    </Grid>
                                                    <Control Margin="0,6,0,0" HorizontalAlignment="Left" Width="280" Template="{DynamicResource DividerTemplate}" IsHitTestVisible="False" Focusable="False">
                                                        <Control.Style>
                                                            <Style TargetType="Control">
                                                                <Setter Property="Foreground" Value="{DynamicResource HeadingRuleBrush}" />
                                                                <Style.Triggers>
                                                                    <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                                                                        <Setter Property="Foreground" Value="{DynamicResource WindowArtForegroundBrush}" />
                                                                    </DataTrigger>
                                                                    <DataTrigger Binding="{Binding Text, ElementName=PART_TextDisplayName}" Value="">
                                                                        <Setter Property="Visibility" Value="Collapsed" />
                                                                    </DataTrigger>
                                                                    <DataTrigger Binding="{Binding Text, ElementName=PART_TextDisplayName}" Value="{x:Null}">
                                                                        <Setter Property="Visibility" Value="Collapsed" />
                                                                    </DataTrigger>
                                                                </Style.Triggers>
                                                            </Style>
                                                        </Control.Style>
                                                    </Control>
                                                </StackPanel>
                                            </DockPanel>

                                            <StackPanel Orientation="Horizontal" Margin="0,16,0,0">
                                                <StackPanel.Resources>
${indent(squareKeycapStyle, 52)}
                                                </StackPanel.Resources>
                                                <Grid Width="184" Height="44">
                                                    <Button x:Name="PART_ButtonPlayAction" Style="{DynamicResource PlayButton}" />
                                                    <Button x:Name="PART_ButtonContextAction" Tag="ContextAction" Style="{DynamicResource PlayButton}" />
                                                    <Control Style="{DynamicResource RunningActionIndicator}" />
                                                </Grid>
                                                <Button x:Name="PART_ButtonMoreActions" Width="40" Height="40" Margin="12,0,0,0" ToolTip="{DynamicResource LOCMoreAction}">
                                                    <ContentControl Content="{DynamicResource IconOptions}" ContentTemplate="{DynamicResource IconTemplate}"
                                                                    Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
                                                </Button>
                                                <Button x:Name="PART_ButtonEditGame" Width="40" Height="40" Margin="8,0,0,0" ToolTip="{DynamicResource LOCEditGame}">
                                                    <ContentControl Content="{DynamicResource IconEdit}" ContentTemplate="{DynamicResource IconTemplate}"
                                                                    Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
                                                </Button>
                                            </StackPanel>
                                        </StackPanel>

                                        <Grid Margin="0,20,0,0">
                                            <StackPanel>
                                                <Grid x:Name="SteamScreenshotsGameScope">
                                                    <Grid.Style>
                                                        <Style TargetType="Grid">
                                                            <Setter Property="Visibility" Value="Collapsed" />
                                                            <Style.Triggers>
                                                                <DataTrigger Binding="{Binding Game.PluginId}" Value="cb91dfc9-b977-43bf-8e70-55f46e410fab">
                                                                    <Setter Property="Visibility" Value="Visible" />
                                                                </DataTrigger>
                                                                <DataTrigger Binding="{Binding Game.Source.Name}" Value="Steam">
                                                                    <Setter Property="Visibility" Value="Visible" />
                                                                </DataTrigger>
                                                            </Style.Triggers>
                                                        </Style>
                                                    </Grid.Style>
                                                    <ContentControl x:Name="SteamScreenshots_SteamScreenshotsViewControl" Margin="0,0,0,20">
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
                                                                            <Condition Binding="{Binding Game.PluginId}" Value="CB91DFC9-B977-43BF-8E70-55F46e410FAB" />
                                                                            <Condition Binding="{PluginSettings Plugin=SteamScreenshots, Path=IsControlVisible, FallbackValue=PluginUnavailable}" Value="False" />
                                                                        </MultiDataTrigger.Conditions>
                                                                        <Setter Property="Visibility" Value="Visible" />
                                                                    </MultiDataTrigger>
                                                                </Style.Triggers>
                                                            </Style>
                                                        </Grid.Style>
                                                        <Control Tag="{Binding Game.Id, NotifyOnTargetUpdated=True}"
                                                                 Template="{DynamicResource SteamScreenshotsSkeletonTemplate}"
                                                                 Foreground="{DynamicResource HeadingRuleBrush}"
                                                                 Margin="0,0,0,20" Visibility="Collapsed">
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
                                                    </Grid>
                                                </Grid>

                                                <StackPanel x:Name="PART_ElemDescription">
${indent(sectionBanner('LOCGameDescriptionTitle'), 52)}
                                                    <HtmlTextView x:Name="PART_HtmlDescription">
                                                        <HtmlTextView.Style>
${indent(htmlTextStyle, 60)}
                                                        </HtmlTextView.Style>
                                                    </HtmlTextView>
                                                </StackPanel>

                                                <StackPanel x:Name="PART_ElemNotes" Margin="0,24,0,0">
${indent(sectionBanner('LOCNotesLabel'), 52)}
                                                    <HtmlTextView x:Name="PART_HtmlNotes">
                                                        <HtmlTextView.Style>
${indent(htmlTextStyle, 60)}
                                                        </HtmlTextView.Style>
                                                    </HtmlTextView>
                                                </StackPanel>
                                            </StackPanel>

                                            <Border Background="{DynamicResource ParchmentBrush}"
                                                    BorderBrush="{DynamicResource ParchmentEdgeBrush}"
                                                    BorderThickness="1"
                                                    CornerRadius="{DynamicResource ControlCornerRadius}"
                                                    VerticalAlignment="Top"
                                                    TextElement.Foreground="{DynamicResource ParchmentTextBrush}">
                                                <Border.Resources>
                                                    <Style TargetType="Hyperlink">
                                                        <Setter Property="Foreground" Value="{DynamicResource ParchmentLinkBrush}" />
                                                        <Style.Triggers>
                                                            <Trigger Property="IsMouseOver" Value="True">
                                                                <Setter Property="Foreground" Value="{DynamicResource ParchmentTextBrush}" />
                                                            </Trigger>
                                                        </Style.Triggers>
                                                    </Style>
                                                </Border.Resources>
                                                <Grid ClipToBounds="True">
                                                    <Border Height="2" VerticalAlignment="Top" Background="{DynamicResource ParchmentLabelBrush}" IsHitTestVisible="False" />
                                                    <Rectangle Fill="{DynamicResource FrameInnerBrush}" Opacity="0.52" IsHitTestVisible="False">
                                                        <Rectangle.OpacityMask>
                                                            <ImageBrush ImageSource="{ThemeFile 'Images/fx/sayagata.png'}" TileMode="Tile" Viewport="0,0,72,72" ViewportUnits="Absolute" Stretch="Fill" />
                                                        </Rectangle.OpacityMask>
                                                    </Rectangle>
                                                    <StackPanel x:Name="${prefix}MetadataContent"
                                                                Width="{DynamicResource ${paneWidthKey}}"
                                                                Margin="16,14,16,14"
                                                                Grid.IsSharedSizeScope="True">
${indent(renderMetaGroups(), 56)}
                                                    </StackPanel>
                                                </Grid>
                                            </Border>
                                        </Grid>
                                    </StackPanel>

                                    <Grid x:Name="EmptyHost" Margin="24,18" IsHitTestVisible="False">
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
                                        <Control Template="{DynamicResource EmptyGameTemplate}" Focusable="False">
                                            <Control.Style>
                                                <Style TargetType="Control">
                                                    <Setter Property="Foreground" Value="{DynamicResource HeadingForegroundBrush}" />
                                                    <Setter Property="BorderBrush" Value="{DynamicResource TextBrushDarker}" />
                                                    <Style.Triggers>
                                                        <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                                                            <Setter Property="Foreground" Value="{DynamicResource WindowArtForegroundBrush}" />
                                                            <Setter Property="BorderBrush" Value="{DynamicResource WindowArtForegroundBrush}" />
                                                        </DataTrigger>
                                                    </Style.Triggers>
                                                </Style>
                                            </Control.Style>
                                        </Control>
                                    </Grid>
                                </Grid>
                            </ScrollViewer>${sidePanelCloseCorner}
                        </Grid>`;

  const body = isGrid
    ? `<Border BorderBrush="{DynamicResource PanelSeparatorBrush}">
                        <Border.Style>
                            <Style TargetType="Border">
                                <Setter Property="BorderThickness" Value="1,0,0,0" />
                                <Style.Triggers>
                                    <DataTrigger Binding="{Settings GridViewDetailsPosition}" Value="Left">
                                        <Setter Property="BorderThickness" Value="0,0,1,0" />
                                    </DataTrigger>
                                    <DataTrigger Binding="{Settings ShowPanelSeparators}" Value="False">
                                        <Setter Property="BorderThickness" Value="0" />
                                    </DataTrigger>
                                </Style.Triggers>
                            </Style>
                        </Border.Style>
                        ${coreGrid}
                    </Border>`
    : coreGrid;

  return `<!--
    Guiding Wind: game overview (${kind}). Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Misty-washi reading canvas with fog-veiled hero banner, sumi-e brush-stroke section headings, dark Sayagata
    lacquer metadata card with antique Tsushima gold labels/links and 6 grouped Meta* sections, proportional banner
    spacer, responsive breakpoints, SteamScreenshots eligibility gate, and EmptyGameTemplate. Structure: Playnite Default 10.60.
-->
<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
                    xmlns:sys="clr-namespace:System;assembly=mscorlib">
    <Style TargetType="${typeName}">
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="${typeName}">
                    ${body}
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;
}

writeOverviews(srcDir, buildOverview('Details'), buildOverview('Grid'));
console.log('Generated DetailsViewGameOverview.xaml and GridViewGameOverview.xaml for GuidingWind.');
