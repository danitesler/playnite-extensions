// Generates Wildhand's two game pages from the shared overview helpers, so both views stay in step.
// Usage: node src/themes/Wildhand/art/gen-overviews.mjs   (then node scripts/game-page-breakpoints.mjs on both files)
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

// A hard 2px-down shadow copy of a TextBlock (Balatro sets every label with one). Binds to the named block's Text.
const shadowText = (source, size, wrap = '', dy = 2) => `<TextBlock Text="{Binding Text, ElementName=${source}}" FontFamily="{DynamicResource LocalPosterFontFamily}" FontSize="${size}"${wrap}
           Foreground="{DynamicResource TextOutlineBrush}" Opacity="0.6" IsHitTestVisible="False"><TextBlock.RenderTransform><TranslateTransform X="0" Y="${dy}" /></TextBlock.RenderTransform></TextBlock>`;

// Score: the price tag, a dark notched tab (the notch is the pane colour showing through) with the poker chip glyph and the number in
// Pixelify Sans, coloured by TextBlockGameScore's rating states (green / money gold / mult red).
const scoreRenderer = (part, layout) => `<Grid${layout === 'stack' ? ' Grid.Column="2"' : ''} HorizontalAlignment="Left" VerticalAlignment="Center" Margin="0,3,0,0">
    <Border Background="{DynamicResource LocalInsetBrush}" CornerRadius="0,0,6,6" Padding="9,6,11,3">
        <StackPanel Orientation="Horizontal">
            <Control Template="{DynamicResource LocalChipTemplate}" Width="13" Height="13" Margin="0,0,6,0" Foreground="{DynamicResource TextBrushDarker}" Focusable="False" IsTabStop="False" />
            <TextBlock x:Name="${part}" Style="{DynamicResource TextBlockGameScore}" FontFamily="{DynamicResource LocalPosterFontFamily}" FontSize="17" Padding="0" Background="Transparent" />
        </StackPanel>
    </Border>
    <Path Data="M0,0 L12,0 L6,5 Z" Fill="{DynamicResource LocalBlackBrush}" HorizontalAlignment="Center" VerticalAlignment="Top" IsHitTestVisible="False" />
</Grid>`;
const fieldOptions = {
  margin: '0,4',
  captionFontSize: 'FontSizeSmall',
  captionVerticalAlignment: 'Center',
  captionMargin: '0',
  valueOptions: { scoreWrap: false },
  scoreRenderer,
};

// Recessed value wells (Hands / Discards cells): text and button values sit in an inset well with a dark 2px top edge.
const well = (inner, name, foreground = 'TextBrush') => `<Grid Grid.Column="2" VerticalAlignment="Center">
    <Border Background="{DynamicResource LocalInsetBrush}" CornerRadius="6" IsHitTestVisible="False" />
    <Border Height="2" VerticalAlignment="Top" Background="{DynamicResource LocalLedgeSlateBrush}" CornerRadius="6,6,0,0" IsHitTestVisible="False" />
${indent(inner(name, foreground), 4)}
</Grid>`;
const wellify = (xaml) => xaml
  .replace(/<TextBlock Grid\.Column="2" x:Name="(PART_Text\w+)" VerticalAlignment="Center" TextWrapping="Wrap" Foreground="\{DynamicResource TextBrush\}" \/>/g,
    (_, name) => well((n, fg) => `<TextBlock x:Name="${n}" Margin="9,3,8,4" MinHeight="20" VerticalAlignment="Center" TextWrapping="Wrap" Foreground="{DynamicResource ${name === 'PART_TextPlayTime' ? 'LocalMoneyBrush' : fg}}" />`, name))
  .replace(/<Button Grid\.Column="2" x:Name="(PART_Button\w+)" HorizontalAlignment="Left" VerticalAlignment="Center" Style="\{DynamicResource PropertyItemButton\}" \/>/g,
    (_, name) => well((n) => `<Button x:Name="${n}" Margin="5,0,4,1" MinHeight="26" HorizontalAlignment="Left" VerticalAlignment="Center" Style="{DynamicResource PropertyItemButton}" />`, name));

// Group break: a dotted leader (DividerTemplate, 3px) + 8px gap. The first group's break is hidden by the pane's negative top
// margin: group margin (8) + break (3 + 8) + field margin (4) = 23.
const groupBreak = `<Control Template="{DynamicResource DividerTemplate}" Focusable="False" IsTabStop="False" IsHitTestVisible="False" Margin="0,0,0,8" />`;
// The metadata pane is one slate panel: a 2px l-black rim, a 4px ledge under it, 14px of panel around the content.
const pane = (widthKey, padding) => `<Grid Grid.Column="2" VerticalAlignment="Top" Margin="0,0,0,4">
    <Control Template="{DynamicResource LocalPanelTemplate}" Background="{DynamicResource LocalBlackBrush}" BorderBrush="{DynamicResource LocalLBlackBrush}"
             Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
    <Border Padding="${padding}">
        <StackPanel Width="{DynamicResource ${widthKey}}">
            <Grid ClipToBounds="True">
                <StackPanel Margin="0,-23,0,-4">
${indent(META_GROUPS.map(g => wellify(metadataGroup(g, 'stack', { margin: '0,8,0,0', padding: '0', borderThickness: '', borderBrush: '', beforeFields: groupBreak, fieldOptions }))).join('\n'), 20)}
                </StackPanel>
            </Grid>
        </StackPanel>
    </Border>
</Grid>`;

// Hero: the game's art fades into the felt, then a CRT scan band (2px lines every 4px) rakes the lower part of the art.
const scanBrush = `<DrawingBrush TileMode="Tile" Viewport="0,0,4,4" ViewportUnits="Absolute" Viewbox="0,0,4,4" ViewboxUnits="Absolute">
    <DrawingBrush.Drawing>
        <GeometryDrawing Brush="{DynamicResource LocalScanBrush}">
            <GeometryDrawing.Geometry>
                <RectangleGeometry Rect="0,0,4,2" />
            </GeometryDrawing.Geometry>
        </GeometryDrawing>
    </DrawingBrush.Drawing>
</DrawingBrush>`;
const pageBackdrop = `<Control Template="{DynamicResource LocalFeltBackdropTemplate}" IsHitTestVisible="False" Focusable="False">
    <Control.Style>
        <Style TargetType="Control">
            <Style.Triggers>
                <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                    <Setter Property="Visibility" Value="Collapsed" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Control.Style>
</Control>
<Control Template="{DynamicResource LocalFeltCornerMarksTemplate}" Foreground="{DynamicResource NormalBorderBrush}" Margin="10" IsHitTestVisible="False" Focusable="False">
    <Control.Style>
        <Style TargetType="Control">
            <Setter Property="Opacity" Value="0.28" />
            <Style.Triggers>
                <DataTrigger Binding="{Settings ShowBackgroundImageOnWindow}" Value="True">
                    <Setter Property="Visibility" Value="Collapsed" />
                </DataTrigger>
            </Style.Triggers>
        </Style>
    </Control.Style>
</Control>`;

const hero = `<Grid x:Name="HeroArt" VerticalAlignment="Top" IsHitTestVisible="False" ClipToBounds="True">
${indent(heroVisibilityStyle(), 4)}
    <FadeImage x:Name="PART_ImageBackground" Stretch="UniformToFill" />
${indent(bannerDarkeningFloor(), 4)}
    <Rectangle Fill="{DynamicResource LocalFeltBrush}">
        <Rectangle.OpacityMask>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                <GradientStop Color="#00000000" Offset="0.38" />
                <GradientStop Color="#FF000000" Offset="1" />
            </LinearGradientBrush>
        </Rectangle.OpacityMask>
    </Rectangle>
    <Rectangle Height="120" VerticalAlignment="Bottom">
        <Rectangle.Fill>
${indent(scanBrush, 12)}
        </Rectangle.Fill>
        <Rectangle.OpacityMask>
            <LinearGradientBrush StartPoint="0,0" EndPoint="0,1">
                <GradientStop Color="#00000000" Offset="0" />
                <GradientStop Color="#FF000000" Offset="0.8" />
            </LinearGradientBrush>
        </Rectangle.OpacityMask>
    </Rectangle>
</Grid>`;

// Title: the game's name on a blind bar (Play-blue ledged bar, white Pixelify Sans with a hard shadow), the icon in a 3px outlined frame.
const titleBody = (fontSize) => `<Border DockPanel.Dock="Left" VerticalAlignment="Center" Margin="0,0,14,0" Background="{DynamicResource LocalInsetBrush}" BorderBrush="{DynamicResource LocalOutlineBrush}" BorderThickness="3" CornerRadius="8"
        Visibility="{Binding Visibility, ElementName=PART_ImageIcon}">
    <Image x:Name="PART_ImageIcon" MaxWidth="54" MaxHeight="54" />
</Border>
<Grid VerticalAlignment="Center" HorizontalAlignment="Left" MinHeight="46" Margin="0,4,0,0">
    <Grid Margin="0,0,0,2" VerticalAlignment="Center">
${indent(shadowText('PART_TextDisplayName', fontSize, ' TextWrapping="Wrap"'), 8)}
        <TextBlock x:Name="PART_TextDisplayName" FontFamily="{DynamicResource LocalPosterFontFamily}" FontSize="${fontSize}"
                   Foreground="{DynamicResource LocalWhiteBrush}" TextWrapping="Wrap" />
    </Grid>
</Grid>`;
const square = (name, tip, icon, style) => `<Button x:Name="${name}" Style="{DynamicResource ${style}}" Width="44" Height="44" Padding="0" Margin="12,0,0,0" ToolTip="{DynamicResource ${tip}}">
    <ContentControl Focusable="False" Content="{DynamicResource ${icon}}" ContentTemplate="{DynamicResource IconTemplate}"
                    Foreground="{Binding Foreground, RelativeSource={RelativeSource AncestorType=Button}}" />
</Button>`;
const actions = (attrs) => `<StackPanel Orientation="Horizontal"${attrs}>
    <Grid MinWidth="164" Height="50">
        <Button x:Name="PART_ButtonPlayAction" Style="{DynamicResource PlayButton}" />
        <Button x:Name="PART_ButtonContextAction" Tag="ContextAction" Style="{DynamicResource PlayButton}" />
        <Control Style="{DynamicResource RunningActionIndicator}" />
    </Grid>
${indent(square('PART_ButtonMoreActions', 'LOCMoreAction', 'IconOptions', 'LocalGameActionSocket'), 4)}
${indent(square('PART_ButtonEditGame', 'LOCEditGame', 'IconEdit', 'LocalGameActionEditSocket'), 4)}
</StackPanel>`;
const steam = steamScreenshotsGate({
  margin: '0,0,0,18',
  skeletonContent: '',
});
// Section heading: money-gold Pixelify Sans caption over a dotted leader.
const heading = (loc) => `<StackPanel Margin="0,0,0,10" HorizontalAlignment="Stretch">
    <TextBlock Text="{DynamicResource ${loc}}" FontFamily="{DynamicResource HeadingFontFamily}" FontSize="{DynamicResource FontSizeLarge}" Foreground="{DynamicResource LocalMoneyBrush}" />
    <Control Template="{DynamicResource DividerTemplate}" Margin="0,6,0,0" Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
</StackPanel>`;
const text = `<StackPanel>
${indent(steam, 4)}
    <StackPanel x:Name="PART_ElemDescription">
${indent(heading('LOCGameDescriptionTitle'), 8)}
        <HtmlTextView x:Name="PART_HtmlDescription" HtmlFontFamily="{DynamicResource FontFamily}" HtmlFontSize="{DynamicResource FontSize}"
                      TextElement.Foreground="{DynamicResource TextBrush}" Tag="{DynamicResource LinkBrush}"
                      HtmlForeground="{Binding Path=(TextElement.Foreground).Color, RelativeSource={RelativeSource Self}}"
                      LinkForeground="{Binding Tag.Color, RelativeSource={RelativeSource Self}}" />
    </StackPanel>
    <StackPanel x:Name="PART_ElemNotes" Margin="0,24,0,0">
${indent(heading('LOCNotesLabel'), 8)}
        <TextBox x:Name="PART_TextNotes" IsReadOnly="True" TextWrapping="Wrap" Style="{DynamicResource BareTextBox}" Foreground="{DynamicResource TextBrush}" />
    </StackPanel>
</StackPanel>`;
const hideWhenEmpty = hideWhenNoGame('StackPanel');
// Empty page: an empty joker slot (dashed card, the mark rocking inside, a 0 / 5 count) with the caption in Pixelify Sans under it.
const emptyCaption = `<TextBlock x:Name="EmptyCaption" Text="{DynamicResource LOCErrorNoGameSelected}" TextAlignment="Center" TextWrapping="Wrap"
           FontFamily="{DynamicResource LocalPosterFontFamily}" FontSize="{DynamicResource FontSizeLarger}" Foreground="{DynamicResource LocalWhiteBrush}" />`;
const empty = `<Grid Height="{Binding ViewportHeight, ElementName=PART_ScrollViewHost}" VerticalAlignment="Top"><Grid.Style><Style TargetType="Grid"><Setter Property="Visibility" Value="Collapsed"/><Style.Triggers><DataTrigger Binding="{Binding Game, FallbackValue={x:Null}}" Value="{x:Null}"><Setter Property="Visibility" Value="Visible"/></DataTrigger></Style.Triggers></Style></Grid.Style>
    <StackPanel VerticalAlignment="Center" HorizontalAlignment="Center" Margin="24">
        <Control Template="{DynamicResource LocalEmptySlotTemplate}" HorizontalAlignment="Center" Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
        <Grid Margin="0,16,0,0" HorizontalAlignment="Center">
${indent(shadowText('EmptyCaption', '{DynamicResource FontSizeLarger}', ' TextAlignment="Center" TextWrapping="Wrap"'), 12)}
            ${emptyCaption}
        </Grid>
        <Control Template="{DynamicResource DividerTemplate}" Width="180" Margin="0,12,0,0" HorizontalAlignment="Center" Focusable="False" IsTabStop="False" IsHitTestVisible="False" />
    </StackPanel>
</Grid>`;
const ns = `xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"`;
const columns = `<Grid.ColumnDefinitions>
    <ColumnDefinition Width="*" />
    <ColumnDefinition Width="24" />
    <ColumnDefinition Width="Auto" />
</Grid.ColumnDefinitions>`;
const details = `<!--
    Wildhand: game page, details view. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    The banner fades into the felt and a CRT scan band rakes its lower part; the title is a blind bar (Play-blue ledged plate)
    with the icon in an outlined frame; Play is the ledged Play Hand plate, More (red) and Edit (orange) are ledged squares;
    the metadata is one slate panel with dotted-leader group breaks, recessed value wells and price-tag scores.
    Structure: Playnite Default 10.60.
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
                            <StackPanel Margin="28,0,28,28">
${indent(hideWhenEmpty, 32)}
${indent(bannerSpacer('x * 146 / 224', 28, 'DetailsBannerSpacer'), 32)}
                                <DockPanel>
${indent(actions(' Margin="16,0,0,0" DockPanel.Dock="Right" VerticalAlignment="Center"'), 36)}
${indent(titleBody('35'), 36)}
                                </DockPanel>
                                <Grid Margin="0,22,0,0">
${indent(columns, 36)}
${indent(text, 36)}
${indent(pane('GameDetailsPaneWidth', '14,12,14,14'), 36)}
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
// Close: the option-arrow square, 28x28: a l-black plate with a ledge and a white X at rest, the danger red fading in on hover with a small rock.
const closeTemplate = `<ControlTemplate TargetType="{x:Type Button}">
    <Grid Background="Transparent" SnapsToDevicePixels="True" RenderTransformOrigin="0.5,0.5">
        <Grid.RenderTransform>
            <TransformGroup>
                <ScaleTransform x:Name="Pop" />
                <RotateTransform x:Name="Rock" />
            </TransformGroup>
        </Grid.RenderTransform>
        <Border Margin="0,3,0,0" Background="{DynamicResource LocalLedgeSlateBrush}" CornerRadius="{DynamicResource ControlCornerRadius}" IsHitTestVisible="False" />
        <Border Margin="0,0,0,3" Background="{DynamicResource ButtonBackgroundBrush}" BorderBrush="{DynamicResource NormalBorderBrush}" BorderThickness="1" CornerRadius="{DynamicResource ControlCornerRadius}" IsHitTestVisible="False" />
        <Border x:Name="HoverPlate" Margin="0,0,0,3" Background="{DynamicResource DangerBrush}" CornerRadius="{DynamicResource ControlCornerRadius}" Opacity="0" IsHitTestVisible="False" />
        <ContentControl x:Name="Glyph" Width="14" Height="14" Margin="0,0,0,3" HorizontalAlignment="Center" VerticalAlignment="Center" IsHitTestVisible="False"
                        Content="{DynamicResource IconWindowClose}" ContentTemplate="{DynamicResource IconTemplate}"
                        Foreground="{DynamicResource TextBrush}" />
    </Grid>
    <ControlTemplate.Triggers>
        <Trigger Property="IsMouseOver" Value="True">
            <Setter TargetName="Glyph" Property="Foreground" Value="{DynamicResource DangerForegroundBrush}" />
            <Trigger.EnterActions>
                <BeginStoryboard x:Name="CloseHoverIn"><Storyboard>
                    <DoubleAnimation Storyboard.TargetName="HoverPlate" Storyboard.TargetProperty="Opacity" To="1" Duration="0:0:0.12" />
                    <DoubleAnimationUsingKeyFrames Storyboard.TargetName="Rock" Storyboard.TargetProperty="Angle">
                        <LinearDoubleKeyFrame KeyTime="0:0:0.05" Value="-6" />
                        <LinearDoubleKeyFrame KeyTime="0:0:0.12" Value="4" />
                        <LinearDoubleKeyFrame KeyTime="0:0:0.2" Value="0" />
                    </DoubleAnimationUsingKeyFrames>
                    <DoubleAnimation Storyboard.TargetName="Pop" Storyboard.TargetProperty="ScaleX" To="1.1" Duration="0:0:0.12" />
                    <DoubleAnimation Storyboard.TargetName="Pop" Storyboard.TargetProperty="ScaleY" To="1.1" Duration="0:0:0.12" />
                </Storyboard></BeginStoryboard>
            </Trigger.EnterActions>
            <Trigger.ExitActions>
                <BeginStoryboard x:Name="CloseHoverOut"><Storyboard>
                    <DoubleAnimation FillBehavior="Stop" Storyboard.TargetName="HoverPlate" Storyboard.TargetProperty="Opacity" To="0" Duration="0:0:0.15" />
                    <DoubleAnimation FillBehavior="Stop" Storyboard.TargetName="Rock" Storyboard.TargetProperty="Angle" To="0" Duration="0:0:0.15" />
                    <DoubleAnimation FillBehavior="Stop" Storyboard.TargetName="Pop" Storyboard.TargetProperty="ScaleX" To="1" Duration="0:0:0.15" />
                    <DoubleAnimation FillBehavior="Stop" Storyboard.TargetName="Pop" Storyboard.TargetProperty="ScaleY" To="1" Duration="0:0:0.15" />
                </Storyboard></BeginStoryboard>
            </Trigger.ExitActions>
        </Trigger>
        <Trigger Property="IsPressed" Value="True">
            <Setter TargetName="HoverPlate" Property="Opacity" Value="0.85" />
        </Trigger>
    </ControlTemplate.Triggers>
</ControlTemplate>`;
const gridTitle = `<DockPanel Panel.ZIndex="2">
${indent(inlineCloseButton(), 4)}
${indent(titleBody('30'), 4)}
</DockPanel>`;
const grid = `<!--
    Wildhand: grid side panel. Generated by art/gen-overviews.mjs; edit the generator, not this file.
    Same skeleton, narrower: spacer x * 128 / 224, a 22px blind-bar title, actions under it, text left and the slate panel right.
    Close is the option-arrow square (red on hover). Structure: Playnite Default 10.60.
-->
<ResourceDictionary ${ns}>
    <Style TargetType="GridViewGameOverview">
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="GridViewGameOverview">
                    <Border BorderBrush="{DynamicResource PanelSeparatorBrush}">
                        <Border.Style>
                            <Style TargetType="Border">
                                <Setter Property="BorderThickness" Value="6,0,0,0" />
                                <Style.Triggers>
                                    <DataTrigger Binding="{Settings GridViewDetailsPosition}" Value="Left">
                                        <Setter Property="BorderThickness" Value="0,0,6,0" />
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
                                    <StackPanel Panel.ZIndex="2" Margin="22,0,22,24">
${indent(hideWhenEmpty, 40)}
${indent(bannerSpacer('x * 128 / 224', 22, 'GridBannerSpacer'), 40)}
                                        <StackPanel Panel.ZIndex="2">
${indent(gridTitle, 44)}
${indent(actions(' Margin="0,16,0,0"'), 44)}
                                        </StackPanel>
                                        <Grid Margin="0,24,0,0">
${indent(columns, 44)}
${indent(text, 44)}
${indent(pane('GridDetailsPaneWidth', '14,12,14,14'), 44)}
                                        </Grid>
                                    </StackPanel>
${indent(empty, 36)}
                                </Grid>
                            </ScrollViewer>
${indent(sidePanelCloseButton({ template: closeTemplate, comment: "<!-- Close: the option-arrow square, 28x28: l-black plate over a ledge with a white X at rest, the danger red fades in on hover with a small rock. -->" }), 28)}
                        </Grid>
                    </Border>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
</ResourceDictionary>
`;
writeOverviews(out, details, grid);
