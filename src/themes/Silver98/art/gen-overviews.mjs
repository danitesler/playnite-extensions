/**
 * Silver 98 overview generator (DetailsViewGameOverview.xaml & GridViewGameOverview.xaml).
 * Emits Silver 98's Windows 95 / Windows 98 Explorer 4.0 Web View & File Properties game page:
 * - Hero banner (GameBannerHeight=260, proportional MathConverter spacer with minimum top gutter at low/zero banner heights,
 *   GameBannerDarken + 50% floor + bottom fade into PageRoot.Background).
 * - Header: Game icon + Pixelify Sans display title (flips to WindowArtForegroundBrush over window art) +
 *   Explorer 4.0 Web View 4-color rule (DividerTemplate) + Win32 Default Push Button PlayButton +
 *   Windows Desktop Teal RunningActionIndicator + equal 40x40 raised 3D silver SecondaryButton More & Edit.
 * - Body: SteamScreenshotsGameScope + Description/Notes alongside a classic Windows 98 File Properties 3D dialog card
 *   (active #000080 -> #1084D0 title bar "Properties — General", sunken #FFFFFF client well, 300px usable inner width,
 *   GameDetailsPanePosition Left / Center / Stretch / Right via scripts/game-page-breakpoints.mjs).
 * - Empty state: Explorer — Program Manager dialog EmptyGameTemplate centered in ViewportHeight when Game is null.
 * - Grid side panel: custom 28x28 Win95/98 raised 3D caption Close button (×) with #A80000 DangerBrush hover
 *   (inline sticky left of icon when GameBannerHeight < 120 or ShowBackgroundImageOnWindow=True; corner 12,12 otherwise).
 *
 * Usage:
 *   node src/themes/Silver98/art/gen-overviews.mjs [src/themes/Silver98/src]
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

// Custom 28x28 Windows 95/98 Raised 3D Caption Close Button (×) with Crimson DangerBrush hover & Sunken press
const silver98CloseTemplate = `<ControlTemplate TargetType="{x:Type Button}">
    <Grid Background="Transparent" SnapsToDevicePixels="True">
        <Border x:Name="Plate" Background="{DynamicResource ButtonBackgroundBrush}"
                CornerRadius="{DynamicResource ControlCornerRadius}" IsHitTestVisible="False" />
        <Border x:Name="HoverPlate" Background="{DynamicResource DangerBrush}"
                CornerRadius="{DynamicResource ControlCornerRadius}"
                Opacity="0" IsHitTestVisible="False" />
        <Control x:Name="RaisedBevel" Template="{DynamicResource LocalRaisedBevelTemplate}" IsHitTestVisible="False" />
        <Control x:Name="SunkenBevel" Template="{DynamicResource LocalSunkenBevelTemplate}"
                 Visibility="Collapsed" IsHitTestVisible="False" />
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
                    <DoubleAnimation Storyboard.TargetName="HoverPlate" Storyboard.TargetProperty="Opacity" To="1" Duration="0:0:0.1" />
                </Storyboard></BeginStoryboard>
            </Trigger.EnterActions>
            <Trigger.ExitActions>
                <BeginStoryboard><Storyboard>
                    <DoubleAnimation FillBehavior="Stop" Storyboard.TargetName="HoverPlate" Storyboard.TargetProperty="Opacity" To="0" Duration="0:0:0.12" />
                </Storyboard></BeginStoryboard>
            </Trigger.ExitActions>
        </Trigger>
        <Trigger Property="IsPressed" Value="True">
            <Setter TargetName="RaisedBevel" Property="Visibility" Value="Collapsed" />
            <Setter TargetName="SunkenBevel" Property="Visibility" Value="Visible" />
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

    const rows = fields.map(([name, loc, kind, part]) => `<Border x:Name="PART_Elem${name}" Padding="0,2">
    <Grid>
        <Grid.ColumnDefinitions>${colDefs}</Grid.ColumnDefinitions>
        <TextBlock Grid.Column="0" Text="{DynamicResource ${loc}}" FontSize="{DynamicResource FontSizeSmall}" FontWeight="Bold" Foreground="{DynamicResource TextBrushDarker}" TextWrapping="Wrap" Margin="0,2,0,0" />
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

  return `<!-- Classic Windows 98 File Properties 3D Dialog Card (Active Navy Title Bar + Sunken White Property Well, 300px usable inner width) -->
<Border VerticalAlignment="Top" HorizontalAlignment="Stretch"
        Background="{DynamicResource PopupBackgroundBrush}" Padding="3" SnapsToDevicePixels="True">
    <Grid>
        <Control Template="{DynamicResource LocalRaisedBevelTemplate}" IsHitTestVisible="False" />
        <DockPanel Margin="3">
            <!-- Windows 98 Active Title Bar Gradient -->
            <Grid DockPanel.Dock="Top" Height="22" Margin="0,0,0,3" Background="{DynamicResource WindowTitleBackgroundBrush}">
                <Rectangle Fill="{DynamicResource LocalCaptionGradientEndBrush}" IsHitTestVisible="False">
                    <Rectangle.OpacityMask>
                        <LinearGradientBrush StartPoint="0,0.5" EndPoint="1,0.5">
                            <GradientStop Color="#00000000" Offset="0" />
                            <GradientStop Color="#FF000000" Offset="1" />
                        </LinearGradientBrush>
                    </Rectangle.OpacityMask>
                </Rectangle>
                <DockPanel Margin="6,0,4,0">
                    <Control Width="14" Height="14" DockPanel.Dock="Left" Margin="0,0,6,0"
                             Template="{DynamicResource LocalFolderIconTemplate}" />
                    <TextBlock Text="{DynamicResource LOCGameDetails}"
                               FontFamily="{DynamicResource FontFamily}"
                               FontSize="{DynamicResource FontSizeSmall}"
                               FontWeight="Bold"
                               Foreground="{DynamicResource WindowTitleForegroundBrush}"
                               VerticalAlignment="Center" />
                </DockPanel>
            </Grid>

            <!-- Sunken White Property Well -->
            <Grid>
                <Border Background="{DynamicResource InputBackgroundBrush}" Padding="14,12,14,12">
                    <StackPanel Width="{DynamicResource ${widthKey}}">
                        <Control Template="{DynamicResource DividerTemplate}" Margin="0,0,0,10" Focusable="False" />
                        <Grid ClipToBounds="True">
                            <StackPanel Margin="0,-28,0,-4">
${indent(blocks, 32)}
                            </StackPanel>
                        </Grid>
                    </StackPanel>
                </Border>
                <Control Template="{DynamicResource LocalSunkenBevelTemplate}" IsHitTestVisible="False" />
            </Grid>
        </DockPanel>
    </Grid>
</Border>`;
}

const sectionHeading = (loc) => `<StackPanel Margin="0,0,0,10">
    <DockPanel Margin="0,0,0,4">
        <Control DockPanel.Dock="Left" Width="16" Height="16" Margin="0,0,7,0" VerticalAlignment="Center"
                 Template="{DynamicResource LocalFolderIconTemplate}" IsHitTestVisible="False" />
        <TextBlock Text="{DynamicResource ${loc}}" Style="{DynamicResource HeadingTextBlock}" />
    </DockPanel>
    <Control Template="{DynamicResource DividerTemplate}" Focusable="False" IsHitTestVisible="False" />
</StackPanel>`;

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
        <TextBox x:Name="PART_TextNotes" IsReadOnly="True" TextWrapping="Wrap"
                 Background="{DynamicResource InputBackgroundBrush}"
                 BorderBrush="{DynamicResource NormalBorderBrush}"
                 BorderThickness="2" Padding="10,8" />
    </StackPanel>
</StackPanel>`;

const heroBanner = `<Grid x:Name="HeroArt" VerticalAlignment="Top" IsHitTestVisible="False">
${indent(heroVisibilityStyle(), 4)}
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill" />
${indent(bannerDarkeningFloor(), 4)}
    <!-- Smooth dissolve into PageRoot.Background (#FFFFFF) so title and Explorer 4.0 Web View header sit cleanly -->
    <Rectangle>
        <Rectangle.Fill>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                <GradientStop Color="#00000000" Offset="0.28" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="0.80" />
                <GradientStop Color="{Binding Background.Color, ElementName=PageRoot}" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.Fill>
    </Rectangle>
</Grid>`;

const actionsRow = `<Grid MinWidth="166" Height="40">
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

const titleStack = `<StackPanel VerticalAlignment="Center">
    <TextBlock x:Name="PART_TextDisplayName" FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLargest}"
               FontWeight="Bold" TextWrapping="Wrap">
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
    <Control Template="{DynamicResource DividerTemplate}" Margin="0,5,0,0" Focusable="False" IsHitTestVisible="False">
${indent(hideWhenNoTitle('Control'), 8)}
    </Control>
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
    Silver 98: Views/DetailsViewGameOverview.xaml (generated by art/gen-overviews.mjs).
    - Explorer 4.0 Web View hero banner (GameBannerHeight=260, spacer x * 204 / 260 floor 20) with GameBannerDarken + 50% floor.
    Simple, authentic Win32 3D dialog layout with active title bar gradient.
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
${indent(bannerSpacer('x * 204 / 260', 20, 'DetailsBannerSpacer'), 32)}
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
    Silver 98: Views/GridViewGameOverview.xaml (generated by art/gen-overviews.mjs).
    - Explorer 4.0 Web View hero banner (GameBannerHeight=260, spacer x * 188 / 260 floor 14) with GameBannerDarken + 50% floor.
    Windows 98 File Properties 3D dialog card in Grid side panel.
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
                                <Setter Property="BorderThickness" Value="2,0,0,0" />
                                <Style.Triggers>
                                    <DataTrigger Binding="{Settings GridViewDetailsPosition}" Value="Left"><Setter Property="BorderThickness" Value="0,0,2,0" /></DataTrigger>
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
${indent(bannerSpacer('x * 188 / 260', 14, 'GridBannerSpacer'), 40)}
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
${indent(sidePanelCloseButton({ template: silver98CloseTemplate, comment: '' }), 28)}
                        </Grid>
                    </Border>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;

writeOverviews(out, detailsXaml, gridXaml);
