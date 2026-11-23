/**
 * Clearwater overview generator (DetailsViewGameOverview.xaml & GridViewGameOverview.xaml).
 * Emits macOS 26 Tahoe Liquid Glass game pages:
 * - Hero banner (GameBannerHeight=320, proportional MathConverter spacer with minimum top gutter floor,
 *   GameBannerDarken + 50% floor + smooth alpine bottom fade into PageRoot.Background).
 * - Header: Game icon + Barlow Bold display title (flips to WindowArtForegroundBrush over window art) +
 *   translucent System Blue refraction rule + Liquid Glass Blue Lens PlayButton + System Green RunningActionIndicator +
 *   equal 38x38 frosted glass More & Edit buttons.
 * - Body: SteamScreenshotsGameScope + Description/Notes alongside macOS Get Info frosted glass metadata sheet
 *   (300px usable inner width, GameDetailsPanePosition Left / Center / Stretch / Right via scripts/game-page-breakpoints.mjs).
 * - Empty state: Frosted Liquid Glass Card centered in ViewportHeight when Game is null.
 * - Grid side panel: custom 28x28 Liquid Glass Close pill (frosted white at rest, macOS traffic-light red on hover)
 *   inline sticky left of icon when GameBannerHeight < 120 or ShowBackgroundImageOnWindow=True; corner 12,12 otherwise.
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

// Custom 28x28 Liquid Glass Close Button: frosted white glass pill at rest, macOS traffic-light red on hover
const clearwaterCloseTemplate = `<ControlTemplate TargetType="{x:Type Button}">
    <Grid Background="Transparent" SnapsToDevicePixels="True">
        <Border x:Name="Plate" Background="{DynamicResource LocalGlassButtonGradient}"
                BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="1"
                CornerRadius="{DynamicResource ControlCornerRadius}" IsHitTestVisible="False">
            <Border CornerRadius="{DynamicResource ControlCornerRadius}" BorderBrush="#DDFFFFFF" BorderThickness="0,1,0,0" />
        </Border>
        <Border x:Name="HoverPlate" Background="{DynamicResource LocalGlassDangerGradient}"
                BorderBrush="{DynamicResource LocalTrafficRedEdgeBrush}" BorderThickness="1"
                CornerRadius="{DynamicResource ControlCornerRadius}" Opacity="0" IsHitTestVisible="False">
            <Border CornerRadius="{DynamicResource ControlCornerRadius}" BorderBrush="#66FFFFFF" BorderThickness="0,1,0,0" />
        </Border>
        <ContentControl x:Name="Glyph" Width="12" Height="12" HorizontalAlignment="Center" VerticalAlignment="Center"
                        IsHitTestVisible="False" Content="{DynamicResource IconWindowClose}"
                        ContentTemplate="{DynamicResource IconTemplate}"
                        Foreground="{DynamicResource ButtonForegroundBrush}" />
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
                    <DoubleAnimation FillBehavior="Stop" Storyboard.TargetName="HoverPlate" Storyboard.TargetProperty="Opacity" To="0" Duration="0:0:0.14" />
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

    const rows = fields.map(([name, loc, kind, part]) => `<Border x:Name="PART_Elem${name}" Padding="0,2.5">
    <Grid>
        <Grid.ColumnDefinitions>${colDefs}</Grid.ColumnDefinitions>
        <TextBlock Grid.Column="0" Text="{DynamicResource ${loc}}" FontSize="{DynamicResource FontSizeSmall}" Foreground="{DynamicResource TextBrushDarker}" TextWrapping="Wrap" Margin="0,2,0,0" />
        <Border Grid.Column="2">${metadataValue(kind, part)}</Border>
    </Grid>
</Border>`).join('\n');

    return `<Border x:Name="${groupName}" Margin="0,9,0,0" Padding="0,9,0,0" BorderThickness="0,1,0,0" BorderBrush="{DynamicResource PanelSeparatorBrush}">
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

  return `<!-- macOS Tahoe Get Info Frosted Glass Sheet (300px usable inner width) -->
<Border VerticalAlignment="Top" HorizontalAlignment="Stretch"
        CornerRadius="{DynamicResource CornerRadiusLarge}"
        Background="{DynamicResource LocalGlassCardGradient}"
        BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="1"
        SnapsToDevicePixels="True">
    <Grid>
        <Border CornerRadius="{DynamicResource CornerRadiusLarge}"
                BorderBrush="{DynamicResource LocalGlassSpecularBrush}" BorderThickness="0,1,0,0"
                Opacity="0.92" IsHitTestVisible="False" />
        <Border Padding="14,12,14,14">
            <StackPanel Width="{DynamicResource ${widthKey}}">
                <Grid ClipToBounds="True">
                    <StackPanel Margin="0,-9,0,0">
${indent(blocks, 24)}
                    </StackPanel>
                </Grid>
            </StackPanel>
        </Border>
    </Grid>
</Border>`;
}

function sectionHeading(locKey) {
  return `<TextBlock Text="{DynamicResource ${locKey}}" FontFamily="{DynamicResource HeadingFontFamily}"
           FontSize="{DynamicResource FontSizeLarge}" FontWeight="Bold" Margin="0,0,0,8">
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
}

const steamSection = steamGameScope(`    <ContentControl x:Name="SteamScreenshots_SteamScreenshotsViewControl" Margin="0,0,0,18">
        <ContentControl.Style>
            <Style TargetType="ContentControl">
                <Setter Property="Visibility" Value="Visible" />
                <Style.Triggers>
                    <Trigger Property="Content" Value="{x:Null}">
                        <Setter Property="Visibility" Value="Collapsed" />
                    </Trigger>
                </Style.Triggers>
            </Style>
        </ContentControl.Style>
    </ContentControl>`);

const mainContent = `<StackPanel Grid.Column="0">
${indent(steamSection, 4)}
    <StackPanel x:Name="PART_ElemDescription">
${indent(sectionHeading('LOCGameDescriptionTitle'), 8)}
        <HtmlTextView x:Name="PART_HtmlDescription" HtmlFontFamily="{DynamicResource FontFamily}" HtmlFontSize="{DynamicResource FontSize}"
                      Tag="{DynamicResource GlyphBrush}"
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
        <TextBox x:Name="PART_TextNotes" IsReadOnly="True" TextWrapping="Wrap"
                 Background="{DynamicResource InputBackgroundBrush}"
                 BorderBrush="{DynamicResource InputBorderBrush}"
                 BorderThickness="1" Padding="10,8" />
    </StackPanel>
</StackPanel>`;

const heroBanner = `<Grid x:Name="HeroArt" VerticalAlignment="Top" IsHitTestVisible="False">
${indent(heroVisibilityStyle(), 4)}
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill" />
${indent(bannerDarkeningFloor(), 4)}
    <Rectangle>
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                <GradientStop Color="#00000000" Offset="0.26" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="0.82" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
</Grid>`;

const actionsRow = `<Grid MinWidth="164" Height="40">
    <Button x:Name="PART_ButtonPlayAction" Style="{DynamicResource PlayButton}" />
    <Button x:Name="PART_ButtonContextAction" Tag="ContextAction" Style="{DynamicResource PlayButton}" />
    <Control Style="{DynamicResource RunningActionIndicator}" />
</Grid>
<Button x:Name="PART_ButtonMoreActions" Width="38" Height="38" Padding="0" Margin="8,0,0,0" ToolTip="{DynamicResource LOCMoreAction}">
    <ContentControl Content="{DynamicResource IconOptions}" ContentTemplate="{DynamicResource IconTemplate}" Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
</Button>
<Button x:Name="PART_ButtonEditGame" Width="38" Height="38" Padding="0" Margin="6,0,0,0" ToolTip="{DynamicResource LOCEditGame}">
    <ContentControl Content="{DynamicResource IconEdit}" ContentTemplate="{DynamicResource IconTemplate}" Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
</Button>`;

const titleStack = `<StackPanel VerticalAlignment="Center">
    <TextBlock x:Name="PART_TextDisplayName" FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLargest}"
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
    </TextBlock>
    <Border Height="2" Margin="0,6,0,0" Background="{DynamicResource GlyphBrush}" IsHitTestVisible="False">
${indent(hideWhenNoTitle('Border'), 8)}
        <Border.OpacityMask>
            <LinearGradientBrush StartPoint="0,0" EndPoint="1,0">
                <GradientStop Color="#FF000000" Offset="0" />
                <GradientStop Color="#00000000" Offset="0.72" />
            </LinearGradientBrush>
        </Border.OpacityMask>
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
    <Border MaxWidth="360" HorizontalAlignment="Center" VerticalAlignment="Center"
            CornerRadius="{DynamicResource CornerRadiusXLarge}"
            Background="{DynamicResource LocalGlassCardGradient}"
            BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="1">
        <Grid>
            <Border CornerRadius="{DynamicResource CornerRadiusXLarge}"
                    BorderBrush="{DynamicResource LocalGlassSpecularBrush}" BorderThickness="0,1,0,0"
                    Opacity="0.92" IsHitTestVisible="False" />
            <Rectangle Fill="{DynamicResource GlyphBrush}" Opacity="0.06" IsHitTestVisible="False">
                <Rectangle.OpacityMask>
                    <ImageBrush ImageSource="{ThemeFile 'Images/fx/tahoe-mist.png'}" Stretch="Fill" />
                </Rectangle.OpacityMask>
            </Rectangle>
            <StackPanel Margin="30,28" HorizontalAlignment="Center">
                <Border Width="52" Height="52" Margin="0,0,0,14" CornerRadius="14"
                        Background="{DynamicResource LocalGlassButtonGradient}"
                        BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="1"
                        HorizontalAlignment="Center">
                    <Control Width="28" Height="28" Template="{DynamicResource LocalClearwaterBrandMarkTemplate}"
                             Foreground="{DynamicResource GlyphBrush}" HorizontalAlignment="Center" VerticalAlignment="Center" />
                </Border>
                <TextBlock Text="{DynamicResource LOCErrorNoGameSelected}"
                           FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLarge}"
                           FontWeight="SemiBold" Foreground="{DynamicResource TextBrush}"
                           TextAlignment="Center" TextWrapping="Wrap" />
            </StackPanel>
        </Grid>
    </Border>
</Grid>`;

function renderTwoColumnBody(prefix, isGrid) {
  return `<Grid Margin="0,14,0,0">
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="*" />
        <ColumnDefinition Width="Auto" />
    </Grid.ColumnDefinitions>
${indent(mainContent, 4)}
    <Grid Grid.Column="1" Margin="22,0,0,0" VerticalAlignment="Top">
${indent(renderMetadata(prefix, isGrid), 8)}
    </Grid>
</Grid>`;
}

const detailsXaml = `<!--
    Clearwater: Views/DetailsViewGameOverview.xaml (generated by art/gen-overviews.mjs).
    macOS Tahoe Liquid Glass game overview with proportional MathConverter banner spacer,
    GameBannerDarken + 50% floor, Liquid Glass PlayButton, and Get Info frosted glass sheet.
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
                            <StackPanel Margin="28,0,28,28">
${indent(hideWhenNoGame('StackPanel'), 32)}
${indent(bannerSpacer('x * 240 / 320', 20, 'DetailsBannerSpacer'), 32)}
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
    Clearwater: Views/GridViewGameOverview.xaml (generated by art/gen-overviews.mjs).
    macOS Tahoe Liquid Glass Grid side panel with proportional MathConverter banner spacer,
    GameBannerDarken + 50% floor, Get Info frosted glass sheet, and custom 28x28 Liquid Glass Close button.
-->
<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">
    <Style TargetType="GridViewGameOverview">
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="GridViewGameOverview">
                    <Border BorderBrush="{DynamicResource NormalBorderBrush}">
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
${indent(sidePanelCloseButton({ template: clearwaterCloseTemplate, comment: '' }), 28)}
                        </Grid>
                    </Border>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;

writeOverviews(out, detailsXaml, gridXaml);
