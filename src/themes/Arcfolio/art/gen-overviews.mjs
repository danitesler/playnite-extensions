// Generates Arcfolio's DetailsViewGameOverview.xaml and GridViewGameOverview.xaml from the shared
// overview helpers and applies responsive GameDetailsPanePosition (Left / Center / Stretch / Right)
// and 900+ / 560-899 / <560 breakpoints automatically.
// Usage: node src/themes/Arcfolio/art/gen-overviews.mjs
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
  steamScreenshotsGate,
  writeOverviews,
} from '../../../../scripts/overview-generator.mjs';

const out = resolveThemeSrcDir(import.meta.url);
const ns = `xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"`;

// Section heading: rotated cyan-teal drafting diamond + Cinzel Bold label + fading hairline rule
const heading = (loc) => `<Grid Margin="0,0,0,10">
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="Auto" />
        <ColumnDefinition Width="Auto" />
        <ColumnDefinition Width="*" />
    </Grid.ColumnDefinitions>
    <Path Grid.Column="0" Width="7" Height="7" Stretch="Fill" VerticalAlignment="Center" Margin="0,0,8,0"
          Data="M3.5,0 L7,3.5 L3.5,7 L0,3.5 Z"
          Stroke="{DynamicResource LocalTealBrightBrush}" StrokeThickness="1.3" Fill="Transparent" IsHitTestVisible="False" />
    <TextBlock Grid.Column="1" Text="{DynamicResource ${loc}}" Style="{DynamicResource HeadingTextBlock}"
               VerticalAlignment="Center" Margin="0,0,10,0" />
    <Rectangle Grid.Column="2" Height="1" VerticalAlignment="Center" Fill="{DynamicResource NormalBorderBrush}" Opacity="0.72" IsHitTestVisible="False" />
</Grid>`;

// Metadata group break: 5px rotated hollow chalk diamond + 1px hairline rule
const groupBreak = `<Grid Margin="0,0,0,8" Height="7" IsHitTestVisible="False">
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="Auto" />
        <ColumnDefinition Width="*" />
    </Grid.ColumnDefinitions>
    <Path Grid.Column="0" Width="5" Height="5" Stretch="Fill" VerticalAlignment="Center" Margin="0,0,7,0"
          Data="M2.5,0 L5,2.5 L2.5,5 L0,2.5 Z"
          Stroke="{DynamicResource LocalChalkDimBrush}" StrokeThickness="1" Fill="Transparent" />
    <Rectangle Grid.Column="1" Height="1" VerticalAlignment="Center" Fill="{DynamicResource NormalBorderBrush}" Opacity="0.82" />
</Grid>`;

const fieldOptions = {
  margin: '0,4',
  captionFontSize: 'FontSizeSmall',
  captionForeground: 'TextBrushDarker',
  captionVerticalAlignment: 'Center',
  captionMargin: '0',
  valueOptions: {
    textFontSize: 'FontSizeSmall',
    scoreWrap: false,
  },
};

// Metadata Ledger: obsidian-petrol dossier bounded on the left by Metaphor's distressed chalk spine
// Negative top margin = -(group margin 10 + groupBreak height 7 + groupBreak bottom 8 + field margin 4) = -29
const pane = (widthKey, padding) => `<Grid Grid.Column="2" VerticalAlignment="Top" Margin="0,0,0,4">
    <Border Background="{DynamicResource ExpanderBackgroundBrush}"
            BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="0,1,1,1"
            CornerRadius="{DynamicResource ControlCornerRadius}" IsHitTestVisible="False" />
    <!-- Distressed chalk-white painted vertical spine bounding the metadata ledger (07_load / 10_equipment) -->
    <Control Width="6" HorizontalAlignment="Left" Margin="-1,0,0,0" Opacity="0.86"
             Template="{DynamicResource LocalSpineVTemplate}"
             Foreground="{DynamicResource LocalChalkLineBrush}"
             Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
    <Border Padding="${padding}">
        <StackPanel Width="{DynamicResource ${widthKey}}">
            <Grid ClipToBounds="True">
                <StackPanel Margin="0,-29,0,-4">
${indent(META_GROUPS.map(g => metadataGroup(g, 'stack', {
  margin: '0,10,0,0',
  padding: '0',
  borderThickness: '',
  borderBrush: '',
  beforeFields: groupBreak,
  fieldOptions,
})).join('\n'), 20)}
                </StackPanel>
            </Grid>
        </StackPanel>
    </Border>
</Grid>`;

// Hero Banner: full-width art masked downward by painterly dry-brush dissolve (banner-dissolve.png)
// inside a BitmapCache wrapper, tinted by GameBannerTintBrush + 50% floor, overlaid with subtle drafting arcs.
const hero = `<Grid x:Name="HeroArt" VerticalAlignment="Top" IsHitTestVisible="False" ClipToBounds="True">
${indent(heroVisibilityStyle(), 4)}
    <Border x:Name="HeroCanvasSwatch" Background="{DynamicResource GameOverviewBackgroundBrush}" Visibility="Collapsed" />
    <Grid OpacityMask="{DynamicResource LocalBannerDissolveMask}">
        <Grid.CacheMode>
            <BitmapCache />
        </Grid.CacheMode>
        <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill" />
${indent(bannerDarkeningFloor(), 8)}
        <Rectangle>
            <Rectangle.Fill>
                <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                    <GradientStop Color="#14081113" Offset="0" />
                    <GradientStop Color="#7A102224" Offset="0.62" />
                    <GradientStop Color="{Binding Background.Color, ElementName=HeroCanvasSwatch}" Offset="1" />
                </LinearGradientBrush>
            </Rectangle.Fill>
        </Rectangle>
    </Grid>
    <!-- Faint architectural astrolabe compass arcs floating in upper right -->
    <Canvas IsHitTestVisible="False">
        <Rectangle Canvas.Right="24" Canvas.Top="-36" Width="400" Height="400" Opacity="0.20"
                   Fill="{DynamicResource LocalChalkLineBrush}"
                   OpacityMask="{DynamicResource LocalDraftingArcsMask}" />
    </Canvas>
</Grid>`;

// Header title cluster: circular Archetype medallion bezel + monumental Cinzel Bold title + distressed chalk rule
const titleBody = (fontSize, iconSize) => `<Grid DockPanel.Dock="Left" VerticalAlignment="Center" Margin="0,0,14,0"
      Width="${iconSize + 14}" Height="${iconSize + 14}"
      Visibility="{Binding Visibility, ElementName=PART_ImageIcon}">
    <!-- Fine cardinal drafting crosshair ticks -->
    <Rectangle Width="1" Height="${iconSize + 20}" HorizontalAlignment="Center" VerticalAlignment="Center"
               Fill="{DynamicResource LocalChalkLineBrush}" Opacity="0.55" IsHitTestVisible="False" />
    <Rectangle Height="1" Width="${iconSize + 20}" HorizontalAlignment="Center" VerticalAlignment="Center"
               Fill="{DynamicResource LocalChalkLineBrush}" Opacity="0.55" IsHitTestVisible="False" />
    <Border Width="${iconSize + 12}" Height="${iconSize + 12}" CornerRadius="${(iconSize + 12) / 2}"
            Background="{DynamicResource MainMenuButtonBackgroundBrush}"
            BorderBrush="{DynamicResource ParchmentBrush}" BorderThickness="1.5" Padding="4"
            HorizontalAlignment="Center" VerticalAlignment="Center">
        <Image x:Name="PART_ImageIcon" MaxWidth="${iconSize}" MaxHeight="${iconSize}" Stretch="Uniform" />
    </Border>
</Grid>
<StackPanel VerticalAlignment="Center">
    <TextBlock x:Name="PART_TextDisplayName" FontFamily="{DynamicResource HeadingFontFamily}"
               FontSize="${fontSize}" FontWeight="Bold"
               Foreground="{DynamicResource ParchmentBrush}" TextWrapping="Wrap" />
    <Control Height="5" Margin="0,5,0,0" HorizontalAlignment="Stretch" MaxWidth="460"
             Template="{DynamicResource LocalHairlineHTemplate}"
             Foreground="{DynamicResource LocalChalkLineBrush}" Opacity="0.86"
             Focusable="False" IsTabStop="False" IsHitTestVisible="False">
${indent(hideWhenNoTitle('Control'), 8)}
    </Control>
</StackPanel>`;

const secButton = (name, tip, icon) => `<Button x:Name="${name}" Style="{DynamicResource SecondaryButton}"
        Width="40" Height="40" Padding="0" Margin="8,0,0,0" ToolTip="{DynamicResource ${tip}}">
    <ContentControl Focusable="False" Content="{DynamicResource ${icon}}" ContentTemplate="{DynamicResource IconTemplate}"
                    Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
</Button>`;

const actions = (attrs) => `<StackPanel Orientation="Horizontal"${attrs}>
    <Grid MinWidth="176" Height="44">
        <Button x:Name="PART_ButtonPlayAction" Style="{DynamicResource PlayButton}" />
        <Button x:Name="PART_ButtonContextAction" Tag="ContextAction" Style="{DynamicResource PlayButton}" />
        <Control Style="{DynamicResource RunningActionIndicator}" />
    </Grid>
${indent(secButton('PART_ButtonMoreActions', 'LOCMoreAction', 'IconOptions'), 4)}
${indent(secButton('PART_ButtonEditGame', 'LOCEditGame', 'IconEdit'), 4)}
</StackPanel>`;

const steam = steamScreenshotsGate({
  mode: 'storyboard',
  innerMargin: '0,0,0,20',
  heading: heading('LOCSteamScreenshotsTitle'),
  includeSourceLoadingTrigger: true,
});

const text = `<StackPanel>
${indent(steam, 4)}
    <StackPanel x:Name="PART_ElemDescription">
${indent(heading('LOCGameDescriptionTitle'), 8)}
        <HtmlTextView x:Name="PART_HtmlDescription" HtmlFontFamily="{DynamicResource FontFamily}" HtmlFontSize="{DynamicResource FontSize}"
                      TextElement.Foreground="{DynamicResource TextBrush}" Tag="{DynamicResource LinkBrush}"
                      HtmlForeground="{Binding Path=(TextElement.Foreground).Color, RelativeSource={RelativeSource Self}}"
                      LinkForeground="{Binding Tag.Color, RelativeSource={RelativeSource Self}}" />
    </StackPanel>
    <StackPanel x:Name="PART_ElemNotes" Margin="0,22,0,0">
${indent(heading('LOCNotesLabel'), 8)}
        <TextBox x:Name="PART_TextNotes" IsReadOnly="True" TextWrapping="Wrap" Style="{DynamicResource BareTextBox}"
                 Foreground="{DynamicResource TextBrush}" />
    </StackPanel>
</StackPanel>`;

const hideWhenEmpty = hideWhenNoGame('StackPanel');

const empty = `<Grid Height="{Binding ViewportHeight, ElementName=PART_ScrollViewHost}" VerticalAlignment="Top">
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

const columns = `<Grid.ColumnDefinitions>
    <ColumnDefinition Width="*" />
    <ColumnDefinition Width="24" />
    <ColumnDefinition Width="Auto" />
</Grid.ColumnDefinitions>`;

const details = `<!--
    Arcfolio: Views/DetailsViewGameOverview.xaml
    Generated by art/gen-overviews.mjs (with scripts/game-page-breakpoints.mjs applied).
    Dry-brush banner dissolve + drafting arcs, Archetype circular icon bezel + Cinzel title on chalk rule,
    Carmine gouache Play CTA + equal 40x40 More/Edit plates, and obsidian-petrol metadata ledger bounded by
    the distressed chalk vertical spine.
-->
<ResourceDictionary ${ns}>
    <Style TargetType="DetailsViewGameOverview">
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="DetailsViewGameOverview">
                    <ScrollViewer x:Name="PART_ScrollViewHost" Visibility="Visible" Style="{DynamicResource DetailsScrollViewer}"
                                  HorizontalScrollBarVisibility="Disabled" VerticalScrollBarVisibility="Auto">
                        <Grid x:Name="PageRoot" UseLayoutRounding="True">
${indent(pageRootStyle(), 28)}
${indent(hero, 28)}
                            <StackPanel Margin="28,0,28,28">
${indent(hideWhenEmpty, 32)}
${indent(bannerSpacer('x * 168 / 320', 28, 'DetailsBannerSpacer'), 32)}
                                <DockPanel>
${indent(actions(' Margin="16,0,0,0" DockPanel.Dock="Right" VerticalAlignment="Center"'), 36)}
${indent(titleBody('28', 40), 36)}
                                </DockPanel>
                                <Grid Margin="0,20,0,0">
${indent(columns, 36)}
${indent(text, 36)}
${indent(pane('GameDetailsPaneWidth', '18,12,14,12'), 36)}
                                </Grid>
                            </StackPanel>
${indent(empty, 28)}
                        </Grid>
                    </ScrollViewer>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;

// Custom 28x28 SidePanelCloseButton: dark architectural square with chalk foot rule;
// sweeps Carmine Rose-Crimson + diagonal chalk accent on hover (120ms).
const closeTemplate = `<ControlTemplate TargetType="{x:Type Button}">
    <Grid Background="Transparent" SnapsToDevicePixels="True">
        <Border x:Name="BasePlate" Background="{DynamicResource SecondaryButtonBackgroundBrush}"
                BorderBrush="{DynamicResource SecondaryButtonBorderBrush}" BorderThickness="1"
                CornerRadius="{DynamicResource ControlCornerRadius}" IsHitTestVisible="False" />
        <Rectangle x:Name="BaseFoot" Height="2" VerticalAlignment="Bottom"
                   Fill="{DynamicResource LocalChalkLineBrush}" IsHitTestVisible="False" />
        <Grid x:Name="HoverPlate" Opacity="0" IsHitTestVisible="False" ClipToBounds="True">
            <Border Background="{DynamicResource DangerBrush}"
                    BorderBrush="{DynamicResource PrimaryButtonHoverBackgroundBrush}" BorderThickness="1"
                    CornerRadius="{DynamicResource ControlCornerRadius}" />
            <Rectangle Width="1.5" Height="34" HorizontalAlignment="Left" Margin="4,0,0,0"
                       Fill="{DynamicResource ParchmentBrush}" Opacity="0.72" RenderTransformOrigin="0.5,0.5">
                <Rectangle.RenderTransform><RotateTransform Angle="24" /></Rectangle.RenderTransform>
            </Rectangle>
        </Grid>
        <ContentControl x:Name="Glyph" Width="14" Height="14" HorizontalAlignment="Center" VerticalAlignment="Center"
                        IsHitTestVisible="False" Content="{DynamicResource IconWindowClose}"
                        ContentTemplate="{DynamicResource IconTemplate}" Foreground="{DynamicResource ParchmentBrush}" />
    </Grid>
    <ControlTemplate.Triggers>
        <Trigger Property="IsMouseOver" Value="True">
            <Setter TargetName="Glyph" Property="Foreground" Value="{DynamicResource DangerForegroundBrush}" />
            <Trigger.EnterActions>
                <BeginStoryboard x:Name="CloseHoverIn">
                    <Storyboard>
                        <DoubleAnimation Storyboard.TargetName="HoverPlate" Storyboard.TargetProperty="Opacity" To="1" Duration="0:0:0.12" />
                    </Storyboard>
                </BeginStoryboard>
            </Trigger.EnterActions>
            <Trigger.ExitActions>
                <BeginStoryboard x:Name="CloseHoverOut">
                    <Storyboard FillBehavior="Stop">
                        <DoubleAnimation Storyboard.TargetName="HoverPlate" Storyboard.TargetProperty="Opacity" To="0" Duration="0:0:0.15" />
                    </Storyboard>
                </BeginStoryboard>
            </Trigger.ExitActions>
        </Trigger>
        <Trigger Property="IsPressed" Value="True">
            <Setter TargetName="HoverPlate" Property="Opacity" Value="0.75" />
        </Trigger>
    </ControlTemplate.Triggers>
</ControlTemplate>`;

const gridTitle = `<DockPanel Panel.ZIndex="2">
${indent(inlineCloseButton(), 4)}
${indent(titleBody('24', 34), 4)}
</DockPanel>`;

const grid = `<!--
    Arcfolio: Views/GridViewGameOverview.xaml
    Generated by art/gen-overviews.mjs (with scripts/game-page-breakpoints.mjs applied).
    Grid side-panel edition of Arcfolio's game overview with custom 28x28 SidePanelCloseButton
    and inline scroll-pinned close button below 120px banner height or when window background art is enabled.
-->
<ResourceDictionary ${ns}>
    <Style TargetType="GridViewGameOverview">
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="GridViewGameOverview">
                    <Border BorderBrush="{DynamicResource NormalBorderBrush}">
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
                        <Grid>
                            <ScrollViewer CanContentScroll="False" x:Name="PART_ScrollViewHost"
                                          HorizontalScrollBarVisibility="Disabled" VerticalScrollBarVisibility="Auto">
                                <Grid x:Name="PageRoot" UseLayoutRounding="True">
${indent(pageRootStyle(), 36)}
${indent(hero, 36)}
                                    <StackPanel Panel.ZIndex="2" Margin="22,0,22,24">
${indent(hideWhenEmpty, 40)}
${indent(bannerSpacer('x * 150 / 320', 22, 'GridBannerSpacer'), 40)}
                                        <StackPanel Panel.ZIndex="2">
${indent(gridTitle, 44)}
${indent(actions(' Margin="0,14,0,0"'), 44)}
                                        </StackPanel>
                                        <Grid Margin="0,20,0,0">
${indent(columns, 44)}
${indent(text, 44)}
${indent(pane('GridDetailsPaneWidth', '18,12,14,12'), 44)}
                                        </Grid>
                                    </StackPanel>
${indent(empty, 36)}
                                </Grid>
                            </ScrollViewer>
${indent(sidePanelCloseButton({ template: closeTemplate, comment: '<!-- Arcfolio custom 28x28 architectural close plate with Carmine hover sweep -->' }), 28)}
                        </Grid>
                    </Border>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;

writeOverviews(out, details, grid);
