// Generates Neonrust's DetailsViewGameOverview.xaml and GridViewGameOverview.xaml from shared overview helpers,
// then applies responsive 900/560 breakpoints and GameDetailsPanePosition (Left/Center/Stretch/Right).
// Usage: node src/themes/Neonrust/art/gen-overviews.mjs
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
  steamScreenshotsGate,
  writeOverviews,
} from '../../../../scripts/overview-generator.mjs';

const out = resolveThemeSrcDir(import.meta.url);

// Score plaque: deep petrol well with subtle teal outer glow, rough-etched rim, and tabular Chakra Petch rating
const scoreRenderer = (part, layout) => `<Grid${layout === 'stack' ? ' Grid.Column="2"' : ''} HorizontalAlignment="Left" VerticalAlignment="Center">
    <Rectangle Margin="-6,-4" Fill="{DynamicResource GlyphBrush}" Opacity="0.28"
               OpacityMask="{DynamicResource LocalItemGlowMask}" IsHitTestVisible="False" />
    <Border Background="{DynamicResource InputBackgroundBrush}" BorderBrush="Transparent" BorderThickness="0"
            CornerRadius="{DynamicResource ControlCornerRadius}">
        <Grid>
            <Control Template="{DynamicResource LocalNeonrustRoughFrameTemplate}"
                     Foreground="{DynamicResource GlyphBrush}" Opacity="0.80"
                     Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
            <TextBlock x:Name="${part}" Style="{DynamicResource TextBlockGameScore}" Background="Transparent" />
        </Grid>
    </Border>
</Grid>`;

const fieldOptions = {
  margin: '0,6',
  captionFontSize: 'FontSize',
  captionVerticalAlignment: 'Center',
  captionMargin: '0',
  valueOptions: { scoreWrap: false },
  scoreRenderer,
};

// Group divider: 5px Solar Yellow diamond + rough-etched Ranger teal hairline (DividerTemplate, 10px) + 6px gap.
// Negative top margin hides the first group's break cleanly: group margin (8) + break (10 + 6) + field margin (6) = 30.
const groupBreak = `<Control Template="{DynamicResource DividerTemplate}" Focusable="False" IsTabStop="False" IsHitTestVisible="False" Margin="0,0,0,6" />`;

// WINGSTICK / CROSS rough-etched Ranger teal dossier with metal-net stains & bruised magenta-plum header glow (PROJECT DAGGER)
const pane = (widthKey, padding) => `<Border Grid.Column="2" VerticalAlignment="Top" Margin="0,0,0,8"
        Background="{DynamicResource ShellBackgroundBrush}"
        BorderBrush="Transparent" BorderThickness="0"
        CornerRadius="{DynamicResource ControlCornerRadius}">
    <Grid>
        <Grid ClipToBounds="True" IsHitTestVisible="False">
            <Rectangle Fill="{DynamicResource GlyphBrush}" Opacity="0.11"
                       OpacityMask="{DynamicResource LocalDatapadMeshMask}" />
            <Rectangle Fill="{DynamicResource ScrimBrush}" Opacity="0.24"
                       OpacityMask="{DynamicResource LocalBgStainsMask}" />
            <Rectangle Width="240" Height="96" HorizontalAlignment="Left" VerticalAlignment="Bottom"
                       Margin="-28,0,0,-32" Fill="{DynamicResource GlyphBrush}" Opacity="0.14"
                       OpacityMask="{DynamicResource LocalSprayHaloMask}" />
        </Grid>
        <DockPanel>
            <!-- Bruised magenta-plum scratched cap bar with atmospheric PROJECT DAGGER title glow -->
            <Border DockPanel.Dock="Top" Height="38" Background="{DynamicResource HeaderBandBrush}"
                    BorderBrush="Transparent" BorderThickness="0">
                <Grid ClipToBounds="True">
                    <Rectangle Fill="{DynamicResource BeamBrush}" Opacity="0.34"
                               OpacityMask="{DynamicResource LocalGrungeHeaderMask}" IsHitTestVisible="False" />
                    <Rectangle Height="34" VerticalAlignment="Bottom" Fill="{DynamicResource BeamBrush}" Opacity="0.46"
                               OpacityMask="{DynamicResource LocalTitleGlowMask}" IsHitTestVisible="False" />
                    <Rectangle Width="3" HorizontalAlignment="Left" Fill="{DynamicResource SelectedBrush}" IsHitTestVisible="False" />
                    <Rectangle Height="4" VerticalAlignment="Bottom" Margin="0,0,0,-1"
                               Fill="{DynamicResource GlyphBrush}" Opacity="0.72"
                               OpacityMask="{DynamicResource LocalRoughEdgeHMask}" IsHitTestVisible="False" />
                    <TextBlock Text="+" FontFamily="{DynamicResource MonospaceFontFamily}" FontSize="12"
                               Foreground="{DynamicResource GlyphBrush}" Opacity="0.72"
                               HorizontalAlignment="Right" VerticalAlignment="Center" Margin="0,0,10,0" IsHitTestVisible="False" />
                    <TextBlock Text="{DynamicResource LOCGameDetails}"
                               FontFamily="{DynamicResource HeadingFontFamily}" FontWeight="Bold" FontSize="18"
                               Foreground="{DynamicResource HeaderBandForegroundBrush}"
                               VerticalAlignment="Center" Margin="12,0,28,0" />
                </Grid>
            </Border>
            <Border Padding="${padding}">
                <StackPanel Width="{DynamicResource ${widthKey}}">
                    <Grid ClipToBounds="True">
                        <StackPanel Margin="0,-30,0,-6">
${indent(META_GROUPS.map(g => metadataGroup(g, 'stack', { margin: '0,8,0,0', padding: '0', borderThickness: '', borderBrush: '', beforeFields: groupBreak, fieldOptions })).join('\n'), 28)}
                        </StackPanel>
                    </Grid>
                </StackPanel>
            </Border>
        </DockPanel>
        <!-- Rough-etched 4-sided dossier outline (like CROSS / PROJECT DAGGER panel) -->
        <Control Template="{DynamicResource LocalNeonrustRoughFrameTemplate}"
                 Foreground="{DynamicResource GlyphBrush}" Opacity="0.74"
                 Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
    </Grid>
</Border>`;

// Subtle datapad mesh + corner glows (collapses when ShowBackgroundImageOnWindow is True)
const pageBackdrop = `<Control Template="{DynamicResource LocalNeonrustBackdropTemplate}" IsHitTestVisible="False" Focusable="False">
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

// Hero Banner: fades into petrol ground over a crisp 1px teal horizon rule + hot-magenta/yellow lead streak
const hero = `<Grid x:Name="HeroArt" VerticalAlignment="Top" IsHitTestVisible="False" ClipToBounds="True">
${indent(heroVisibilityStyle(), 4)}
    <Grid.CacheMode>
        <BitmapCache />
    </Grid.CacheMode>
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill" />
${indent(bannerDarkeningFloor(), 4)}
    <Rectangle Fill="{DynamicResource GameOverviewBackgroundBrush}">
        <Rectangle.OpacityMask>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                <GradientStop Color="#00000000" Offset="0.22" />
                <GradientStop Color="#7A000000" Offset="0.62" />
                <GradientStop Color="#FF000000" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.OpacityMask>
    </Rectangle>
</Grid>`;

// Title & Icon: glowing Ranger icon + bold Solar Acid Yellow Chakra Petch display name over RAGE 2 rising magenta title glow (CROSS)
const titleBody = (fontSize) => `<Grid DockPanel.Dock="Left" Margin="0,0,14,0" VerticalAlignment="Center">
    <Rectangle Margin="-12" Fill="{DynamicResource GlyphBrush}" Opacity="0.46"
               OpacityMask="{DynamicResource LocalItemGlowMask}" IsHitTestVisible="False" />
    <Image x:Name="PART_ImageIcon" MaxWidth="44" MaxHeight="44" VerticalAlignment="Center"
           RenderOptions.BitmapScalingMode="Fant" Stretch="Uniform" />
</Grid>
<Grid VerticalAlignment="Center">
    <!-- Atmospheric magenta-crimson rising luminescence behind the game title (like CROSS / WASTELAND CELEBRITY) -->
    <Rectangle Margin="-12,-6,-18,-4" Fill="{DynamicResource BeamBrush}" Opacity="0.38"
               OpacityMask="{DynamicResource LocalTitleGlowMask}" IsHitTestVisible="False" />
    <StackPanel VerticalAlignment="Center">
        <TextBlock x:Name="PART_TextDisplayName" VerticalAlignment="Center"
                   FontFamily="{DynamicResource HeadingFontFamily}" FontWeight="Bold" FontSize="${fontSize}"
                   Foreground="{DynamicResource HeadingForegroundBrush}" TextWrapping="Wrap" />
        <Rectangle Height="4" Margin="0,4,0,0" HorizontalAlignment="Stretch"
                   Fill="{DynamicResource HeadingMarkerBrush}" Opacity="0.72"
                   OpacityMask="{DynamicResource LocalRoughEdgeHMask}" IsHitTestVisible="False" />
    </StackPanel>
</Grid>`;

// Equal 40x40 chamfered icon-only More & Edit buttons with rough-etched outline & hover teal glow
const secBtnTemplate = `<ControlTemplate TargetType="{x:Type Button}">
    <Grid Background="Transparent" SnapsToDevicePixels="True">
        <Rectangle x:Name="Plate" Fill="{DynamicResource SecondaryButtonBackgroundBrush}"
                   OpacityMask="{DynamicResource LocalYellowSlabMask}" IsHitTestVisible="False" />
        <Rectangle x:Name="RoughRim" Fill="{DynamicResource GlyphBrush}" Opacity="0.68"
                   OpacityMask="{DynamicResource LocalRoughBorderRowMask}" IsHitTestVisible="False" />
        <Grid x:Name="HoverPlate" Visibility="Collapsed" Opacity="0" IsHitTestVisible="False">
            <Rectangle Margin="-8" Fill="{DynamicResource GlyphBrush}" Opacity="0.42"
                       OpacityMask="{DynamicResource LocalItemGlowMask}" />
            <Rectangle Fill="{DynamicResource SecondaryButtonHoverBackgroundBrush}"
                       OpacityMask="{DynamicResource LocalYellowSlabMask}" />
            <Rectangle Fill="{DynamicResource GlyphBrush}"
                       OpacityMask="{DynamicResource LocalRoughBorderRowMask}" />
        </Grid>
        <ContentPresenter HorizontalAlignment="Center" VerticalAlignment="Center" />
    </Grid>
    <ControlTemplate.Triggers>
        <Trigger Property="IsMouseOver" Value="True">
            <Setter Property="Foreground" Value="{DynamicResource SelectedBrush}" />
            <Trigger.EnterActions>
                <BeginStoryboard x:Name="SecIn"><Storyboard>
                    <ObjectAnimationUsingKeyFrames Storyboard.TargetName="HoverPlate" Storyboard.TargetProperty="Visibility">
                        <DiscreteObjectKeyFrame KeyTime="0:0:0" Value="{x:Static Visibility.Visible}" />
                    </ObjectAnimationUsingKeyFrames>
                    <DoubleAnimation Storyboard.TargetName="HoverPlate" Storyboard.TargetProperty="Opacity" To="1" Duration="0:0:0.11" />
                </Storyboard></BeginStoryboard>
            </Trigger.EnterActions>
            <Trigger.ExitActions>
                <BeginStoryboard x:Name="SecOut"><Storyboard FillBehavior="Stop">
                    <DoubleAnimation Storyboard.TargetName="HoverPlate" Storyboard.TargetProperty="Opacity" To="0" Duration="0:0:0.16" />
                    <ObjectAnimationUsingKeyFrames Storyboard.TargetName="HoverPlate" Storyboard.TargetProperty="Visibility">
                        <DiscreteObjectKeyFrame KeyTime="0:0:0.16" Value="{x:Static Visibility.Collapsed}" />
                    </ObjectAnimationUsingKeyFrames>
                </Storyboard></BeginStoryboard>
            </Trigger.ExitActions>
        </Trigger>
        <Trigger Property="IsPressed" Value="True">
            <Setter TargetName="Plate" Property="Fill" Value="{DynamicResource SecondaryButtonPressedBackgroundBrush}" />
        </Trigger>
    </ControlTemplate.Triggers>
</ControlTemplate>`;

const squareBtn = (name, tip, icon) => `<Button x:Name="${name}" Width="40" Height="40" MinWidth="40" MinHeight="40" Padding="0" Margin="8,0,0,0"
        Cursor="Hand" FocusVisualStyle="{DynamicResource FocusVisual}"
        Foreground="{DynamicResource GlyphBrush}" ToolTip="{DynamicResource ${tip}}">
    <Button.Template>
${indent(secBtnTemplate, 8)}
    </Button.Template>
    <ContentControl Focusable="False" Content="{DynamicResource ${icon}}" ContentTemplate="{DynamicResource IconTemplate}"
                    Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
</Button>`;

const actions = (attrs) => `<StackPanel Orientation="Horizontal"${attrs}>
    <Grid MinWidth="174" Height="42">
        <Button x:Name="PART_ButtonPlayAction" Style="{DynamicResource PlayButton}" />
        <Button x:Name="PART_ButtonContextAction" Tag="ContextAction" Style="{DynamicResource PlayButton}" />
        <Control Style="{DynamicResource RunningActionIndicator}" />
    </Grid>
${indent(squareBtn('PART_ButtonMoreActions', 'LOCMoreAction', 'IconOptions'), 4)}
${indent(squareBtn('PART_ButtonEditGame', 'LOCEditGame', 'IconEdit'), 4)}
</StackPanel>`;

// Section heading with RAGE 2 WASTELAND CELEBRITY / LEVEL rising background glow & rough-etched underline
const heading = (loc) => `<Grid HorizontalAlignment="Stretch" Margin="0,0,0,12">
    <Rectangle Height="38" MaxWidth="360" HorizontalAlignment="Left" VerticalAlignment="Bottom"
               Margin="-8,0,0,1" Fill="{DynamicResource BeamBrush}" Opacity="0.44"
               OpacityMask="{DynamicResource LocalTitleGlowMask}" IsHitTestVisible="False" />
    <StackPanel>
        <StackPanel Orientation="Horizontal" VerticalAlignment="Center" Margin="0,4,0,0">
            <Rectangle Width="4" Height="16" Margin="0,0,8,0" VerticalAlignment="Center"
                       Fill="{DynamicResource HeadingMarkerBrush}" IsHitTestVisible="False" />
            <TextBlock Text="{DynamicResource ${loc}}" Style="{DynamicResource HeadingTextBlock}" VerticalAlignment="Center" />
        </StackPanel>
        <Grid Height="4" Margin="0,4,0,0" IsHitTestVisible="False">
            <Rectangle Height="4" VerticalAlignment="Center" Fill="{DynamicResource GlyphBrush}" Opacity="0.62"
                       OpacityMask="{DynamicResource LocalRoughEdgeHMask}" />
            <Rectangle Width="180" Height="2" HorizontalAlignment="Left" VerticalAlignment="Center"
                       Fill="{DynamicResource HeadingMarkerBrush}" Opacity="0.92">
                <Rectangle.OpacityMask>
                    <LinearGradientBrush StartPoint="0,0" EndPoint="1,0">
                        <GradientStop Color="#FF000000" Offset="0" />
                        <GradientStop Color="#CC000000" Offset="0.55" />
                        <GradientStop Color="#00000000" Offset="1" />
                    </LinearGradientBrush>
                </Rectangle.OpacityMask>
            </Rectangle>
        </Grid>
    </StackPanel>
</Grid>`;

const steam = steamScreenshotsGate({
  mode: 'storyboard',
  innerMargin: '0,0,0,20',
  skeletonForeground: 'GlyphBrush',
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
        <TextBox x:Name="PART_TextNotes" IsReadOnly="True" TextWrapping="Wrap" Style="{DynamicResource BareTextBox}" Foreground="{DynamicResource TextBrush}" />
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

const ns = `xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"`;
const columns = `<Grid.ColumnDefinitions>
    <ColumnDefinition Width="*" />
    <ColumnDefinition Width="22" />
    <ColumnDefinition Width="Auto" />
</Grid.ColumnDefinitions>`;

const details = `<!--
    Neonrust: Views/DetailsViewGameOverview.xaml. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Ranger Datapad game page: petrol-fading banner over 1px teal horizon + hot-magenta flare, Solar Yellow Chakra Petch
    title, Hot Punk Magenta dry-brush Play CTA, equal 40x40 chamfered More/Edit sockets, and bruised-magenta-capped
    WINGSTICK/CROSS metadata dossier.
-->
<ResourceDictionary ${ns}>
    <Style TargetType="DetailsViewGameOverview">
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="DetailsViewGameOverview">
                    <ScrollViewer x:Name="PART_ScrollViewHost" Visibility="Visible" Style="{DynamicResource DetailsScrollViewer}" HorizontalScrollBarVisibility="Disabled" VerticalScrollBarVisibility="Auto">
                        <Grid x:Name="PageRoot" UseLayoutRounding="True">
${indent(pageRootStyle(), 28)}
${indent(pageBackdrop, 28)}
${indent(hero, 28)}
                            <StackPanel Margin="24,0,24,24">
${indent(hideWhenEmpty, 32)}
${indent(bannerSpacer('x * 224 / 320', 24, 'DetailsBannerSpacer'), 32)}
                                <DockPanel>
${indent(actions(' Margin="16,0,28,0" DockPanel.Dock="Right" VerticalAlignment="Center"'), 36)}
${indent(titleBody('36'), 36)}
                                </DockPanel>
                                <Grid Margin="0,20,0,0">
${indent(columns, 36)}
${indent(text, 36)}
${indent(pane('GameDetailsPaneWidth', '14,10,14,12'), 36)}
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

// Custom 28x28 45-deg chamfered SidePanelCloseButton (Authority Crimson hover)
const closeTemplate = `<ControlTemplate TargetType="{x:Type Button}">
    <Grid Background="Transparent" SnapsToDevicePixels="True">
        <Path Stretch="Fill" Fill="{DynamicResource ButtonBackgroundBrush}"
              Stroke="{DynamicResource NormalBorderBrush}" StrokeThickness="1"
              Data="M 6,0.5 L 27.5,0.5 L 27.5,22 L 22,27.5 L 0.5,27.5 L 0.5,6 Z" IsHitTestVisible="False" />
        <Path x:Name="HoverPlate" Stretch="Fill" Fill="{DynamicResource DangerBrush}" Opacity="0"
              Data="M 6,0.5 L 27.5,0.5 L 27.5,22 L 22,27.5 L 0.5,27.5 L 0.5,6 Z" IsHitTestVisible="False" />
        <ContentControl x:Name="Glyph" Width="14" Height="14" HorizontalAlignment="Center" VerticalAlignment="Center" IsHitTestVisible="False"
                        Content="{DynamicResource IconWindowClose}" ContentTemplate="{DynamicResource IconTemplate}"
                        Foreground="{DynamicResource TextBrush}" />
    </Grid>
    <ControlTemplate.Triggers>
        <Trigger Property="IsMouseOver" Value="True">
            <Setter TargetName="Glyph" Property="Foreground" Value="{DynamicResource DangerForegroundBrush}" />
            <Trigger.EnterActions>
                <BeginStoryboard x:Name="CloseHoverIn"><Storyboard>
                    <DoubleAnimation Storyboard.TargetName="HoverPlate" Storyboard.TargetProperty="Opacity" To="1" Duration="0:0:0.12" />
                </Storyboard></BeginStoryboard>
            </Trigger.EnterActions>
            <Trigger.ExitActions>
                <BeginStoryboard x:Name="CloseHoverOut"><Storyboard FillBehavior="Stop">
                    <DoubleAnimation Storyboard.TargetName="HoverPlate" Storyboard.TargetProperty="Opacity" To="0" Duration="0:0:0.15" />
                </Storyboard></BeginStoryboard>
            </Trigger.ExitActions>
        </Trigger>
        <Trigger Property="IsPressed" Value="True">
            <Setter TargetName="HoverPlate" Property="Opacity" Value="0.75" />
        </Trigger>
    </ControlTemplate.Triggers>
</ControlTemplate>`;

const gridTitle = `<DockPanel Panel.ZIndex="2">
${indent(inlineCloseButton(), 4)}
${indent(titleBody('30'), 4)}
</DockPanel>`;

const grid = `<!--
    Neonrust: Views/GridViewGameOverview.xaml. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Ranger Datapad grid side panel with custom 28x28 chamfered SidePanelCloseButton (corner >=120px, inline <120px or window art).
-->
<ResourceDictionary ${ns}>
    <Style TargetType="GridViewGameOverview">
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="GridViewGameOverview">
                    <Border BorderBrush="{DynamicResource WindowPanelSeparatorBrush}">
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
                            <ScrollViewer CanContentScroll="False" x:Name="PART_ScrollViewHost" HorizontalScrollBarVisibility="Disabled" VerticalScrollBarVisibility="Auto">
                                <Grid x:Name="PageRoot" UseLayoutRounding="True">
${indent(pageRootStyle(), 36)}
${indent(pageBackdrop, 36)}
${indent(hero, 36)}
                                    <StackPanel Panel.ZIndex="2" Margin="20,0,20,24">
${indent(hideWhenEmpty, 40)}
${indent(bannerSpacer('x * 204 / 320', 20, 'GridBannerSpacer'), 40)}
                                        <StackPanel Panel.ZIndex="2">
${indent(gridTitle, 44)}
${indent(actions(' Margin="0,14,0,0"'), 44)}
                                        </StackPanel>
                                        <Grid Margin="0,20,0,0">
${indent(columns, 44)}
${indent(text, 44)}
${indent(pane('GridDetailsPaneWidth', '14,10,14,12'), 44)}
                                        </Grid>
                                    </StackPanel>
${indent(empty, 36)}
                                </Grid>
                            </ScrollViewer>
${indent(sidePanelCloseButton({ template: closeTemplate, comment: "<!-- Close: 28x28 chamfered Ranger plate turning Authority Crimson on hover. -->" }), 28)}
                        </Grid>
                    </Border>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;

writeOverviews(out, details, grid);
