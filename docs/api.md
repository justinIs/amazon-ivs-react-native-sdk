# amazon-ivs-react-native-sdk

## Classes

### IVSError

Normalized error from the IVS Real-Time SDK.
All promise rejections and `error` events are instances of this class.

#### Extends

- `Error`

#### Constructors

##### Constructor

```ts
new IVSError(
   code, 
   message, 
   nativeError?): IVSError;
```

###### Parameters

###### code

[`IVSErrorCode`](#ivserrorcode-1)

###### message

`string`

###### nativeError?

[`NativeErrorDetails`](#nativeerrordetails)

###### Returns

[`IVSError`](#ivserror)

###### Overrides

```ts
Error.constructor
```

#### Properties

##### cause?

```ts
optional cause?: unknown;
```

###### Inherited from

```ts
Error.cause
```

##### code

```ts
readonly code: IVSErrorCode;
```

##### message

```ts
message: string;
```

###### Inherited from

```ts
Error.message
```

##### name

```ts
name: string;
```

###### Inherited from

```ts
Error.name
```

##### nativeError?

```ts
readonly optional nativeError?: NativeErrorDetails;
```

##### stack?

```ts
optional stack?: string;
```

###### Inherited from

```ts
Error.stack
```

#### Methods

##### fromUnknown()

```ts
static fromUnknown(error, fallbackCode?): IVSError;
```

###### Parameters

###### error

`unknown`

###### fallbackCode?

[`IVSErrorCode`](#ivserrorcode-1) = `'unknown'`

###### Returns

[`IVSError`](#ivserror)

##### isError()

```ts
static isError(error): error is Error;
```

Indicates whether the argument provided is a built-in Error instance or not.

###### Parameters

###### error

`unknown`

###### Returns

`error is Error`

###### Inherited from

```ts
Error.isError
```

##### isIVSError()

```ts
static isIVSError(error): error is IVSError;
```

###### Parameters

###### error

`unknown`

###### Returns

`error is IVSError`

***

### IVSStage

Imperative Stage core.
Wraps the TurboModule with typed methods and a typed event emitter.
The React provider/hooks layer is built strictly on top of this object.

#### Constructors

##### Constructor

```ts
new IVSStage(_options?): IVSStage;
```

###### Parameters

###### \_options?

[`IVSStageOptions`](#ivsstageoptions)

###### Returns

[`IVSStage`](#ivsstage)

#### Methods

##### dispose()

```ts
dispose(): void;
```

Tear down native event subscriptions and free the active-stage slot.
Calls after dispose reject with code `disposed`.

###### Returns

`void`

##### flipCamera()

```ts
flipCamera(): Promise<void>;
```

###### Returns

`Promise`\<`void`\>

##### getAudioRoute()

```ts
getAudioRoute(): Promise<IVSAudioRoute>;
```

###### Returns

`Promise`\<[`IVSAudioRoute`](#ivsaudioroute)\>

##### join()

```ts
join(token, opts?): Promise<void>;
```

Join a stage with a participant token.
Connects without publishing unless `opts.publish` is true.
Rejects with `stage-in-use` if another IVSStage is already joined.

###### Parameters

###### token

`string`

###### opts?

[`JoinOptions`](#joinoptions) = `{}`

###### Returns

`Promise`\<`void`\>

##### leave()

```ts
leave(): Promise<void>;
```

Leave the current stage and release local streams/devices.

###### Returns

`Promise`\<`void`\>

##### listParticipants()

```ts
listParticipants(): Promise<IVSParticipantInfo[]>;
```

###### Returns

`Promise`\<[`IVSParticipantInfo`](#ivsparticipantinfo)[]\>

##### on()

```ts
on<E>(event, listener): () => void;
```

Subscribe to a Stage event. Returns an unsubscribe function.

###### Type Parameters

###### E

`E` *extends* keyof [`StageEventMap`](#stageeventmap)

###### Parameters

###### event

`E`

###### listener

[`Listener`](#listener)\<`E`\>

###### Returns

() => `void`

##### prepareDevices()

```ts
prepareDevices(opts?): Promise<void>;
```

###### Parameters

###### opts?

###### camera?

`boolean`

###### microphone?

`boolean`

###### Returns

`Promise`\<`void`\>

##### readState()

```ts
readState(): Promise<IVSStageState>;
```

###### Returns

`Promise`\<[`IVSStageState`](#ivsstagestate)\>

##### releaseDevices()

```ts
releaseDevices(): Promise<void>;
```

###### Returns

`Promise`\<`void`\>

##### renewToken()

```ts
renewToken(token): Promise<void>;
```

Renew the participant token via a managed native Stage rebuild.
Preserves device holds, publish intent, subscribe config, and view registry.
The local participantId changes; participantLeft/Joined are emitted for local.

###### Parameters

###### token

`string`

###### Returns

`Promise`\<`void`\>

##### setAudioOutput()

```ts
setAudioOutput(output): Promise<void>;
```

###### Parameters

###### output

[`AudioOutput`](#audiooutput-1)

###### Returns

`Promise`\<`void`\>

##### setAudioPreset()

```ts
setAudioPreset(preset): Promise<void>;
```

###### Parameters

###### preset

[`AudioPreset`](#audiopreset)

###### Returns

`Promise`\<`void`\>

##### setCameraEnabled()

```ts
setCameraEnabled(enabled): Promise<void>;
```

###### Parameters

###### enabled

`boolean`

###### Returns

`Promise`\<`void`\>

##### setCameraPosition()

```ts
setCameraPosition(position): Promise<void>;
```

###### Parameters

###### position

[`CameraPosition`](#cameraposition-1)

###### Returns

`Promise`\<`void`\>

##### setDefaultSubscribeType()

```ts
setDefaultSubscribeType(type): Promise<void>;
```

###### Parameters

###### type

[`SubscribeType`](#subscribetype)

###### Returns

`Promise`\<`void`\>

##### setMicrophoneEnabled()

```ts
setMicrophoneEnabled(enabled): Promise<void>;
```

###### Parameters

###### enabled

`boolean`

###### Returns

`Promise`\<`void`\>

##### ~~setMicrophoneMuted()~~

```ts
setMicrophoneMuted(muted): Promise<void>;
```

###### Parameters

###### muted

`boolean`

###### Returns

`Promise`\<`void`\>

###### Deprecated

Use setMicrophoneEnabled(!muted)

##### setPublishEnabled()

```ts
setPublishEnabled(enabled): Promise<void>;
```

###### Parameters

###### enabled

`boolean`

###### Returns

`Promise`\<`void`\>

##### ~~setPublishing()~~

```ts
setPublishing(enabled): Promise<void>;
```

###### Parameters

###### enabled

`boolean`

###### Returns

`Promise`\<`void`\>

###### Deprecated

Use setPublishEnabled

##### setSubscribeType()

```ts
setSubscribeType(participantId, type): Promise<void>;
```

###### Parameters

###### participantId

`string`

###### type

[`SubscribeType`](#subscribetype)

###### Returns

`Promise`\<`void`\>

##### setVideoConfig()

```ts
setVideoConfig(config): Promise<void>;
```

###### Parameters

###### config

[`IVSVideoConfig`](#ivsvideoconfig)

###### Returns

`Promise`\<`void`\>

##### ~~switchCamera()~~

```ts
switchCamera(position?): Promise<void>;
```

###### Parameters

###### position?

[`CameraPosition`](#cameraposition-1)

###### Returns

`Promise`\<`void`\>

###### Deprecated

Use flipCamera() or setCameraPosition(position)

## Interfaces

### IVSAudioRoute

#### Properties

##### activeOutput

```ts
activeOutput: "bluetooth" | "speaker" | "earpiece" | "wired";
```

What the OS actually selected — `auto` resolves to a concrete port.

##### availableOutputs

```ts
availableOutputs: ("bluetooth" | "speaker" | "earpiece" | "wired")[];
```

Outputs currently connected and selectable on this device.

##### output

```ts
output: AudioOutput;
```

What the app asked for.

***

### IVSCapabilities

#### Properties

##### audioRouting

```ts
audioRouting: boolean;
```

##### backgroundAudio

```ts
backgroundAudio: boolean;
```

##### bluetoothMicrophone

```ts
bluetoothMicrophone: boolean;
```

##### rtcStats

```ts
rtcStats: boolean;
```

##### screenShare

```ts
screenShare: boolean;
```

##### simulcast

```ts
simulcast: boolean;
```

***

### IVSDeviceInfo

#### Properties

##### deviceId

```ts
deviceId: string;
```

##### friendlyName

```ts
friendlyName: string;
```

##### isDefault

```ts
isDefault: boolean;
```

##### position

```ts
position: DevicePosition;
```

##### type

```ts
type: DeviceType;
```

##### urn

```ts
urn: string;
```

***

### IVSLocalPreviewViewProps

#### Extends

- `ViewProps`

#### Properties

##### accessibilityActions?

```ts
readonly optional accessibilityActions?: readonly Readonly<{
  label?: string;
  name: string;
}>[];
```

Provides an array of custom actions available for accessibility.

###### Inherited from

```ts
ViewProps.accessibilityActions
```

##### accessibilityElementsHidden?

```ts
readonly optional accessibilityElementsHidden?: boolean;
```

A value indicating whether the accessibility elements contained within
this accessibility element are hidden.

###### Platform

ios

See https://reactnative.dev/docs/view#accessibilityElementsHidden

###### Inherited from

```ts
ViewProps.accessibilityElementsHidden
```

##### accessibilityHint?

```ts
readonly optional accessibilityHint?: string;
```

An accessibility hint helps users understand what will happen when they perform
an action on the accessibility element when that result is not obvious from the
accessibility label.

See https://reactnative.dev/docs/view#accessibilityHint

###### Inherited from

```ts
ViewProps.accessibilityHint
```

##### accessibilityIgnoresInvertColors?

```ts
readonly optional accessibilityIgnoresInvertColors?: boolean;
```

Prevents view from being inverted if set to true and color inversion is turned on.

###### Platform

ios

###### Inherited from

```ts
ViewProps.accessibilityIgnoresInvertColors
```

##### accessibilityLabel?

```ts
readonly optional accessibilityLabel?: string;
```

Overrides the text that's read by the screen reader when the user interacts
with the element. By default, the label is constructed by traversing all
the children and accumulating all the `Text` nodes separated by space.

See https://reactnative.dev/docs/view#accessibilitylabel

###### Inherited from

```ts
ViewProps.accessibilityLabel
```

##### accessibilityLabelledBy?

```ts
readonly optional accessibilityLabelledBy?: string | string[];
```

Identifies the element that labels the element it is applied to. When the assistive technology focuses on the component with this props,
the text is read aloud. The value should should match the nativeID of the related element.

###### Platform

android

###### Inherited from

```ts
ViewProps.accessibilityLabelledBy
```

##### accessibilityLanguage?

```ts
readonly optional accessibilityLanguage?: string;
```

Indicates to the accessibility services that the UI component is in
a specific language. The provided string should be formatted following
the BCP 47 specification (https://www.rfc-editor.org/info/bcp47).

###### Platform

ios

###### Inherited from

```ts
ViewProps.accessibilityLanguage
```

##### accessibilityLargeContentTitle?

```ts
readonly optional accessibilityLargeContentTitle?: string;
```

###### Platform

ios

See https://reactnative.dev/docs/view#accessibilitylargecontenttitle

###### Inherited from

```ts
ViewProps.accessibilityLargeContentTitle
```

##### accessibilityLiveRegion?

```ts
readonly optional accessibilityLiveRegion?: "none" | "polite" | "assertive";
```

Indicates to accessibility services whether the user should be notified
when this view changes. Works for Android API >= 19 only.

###### Platform

android

See https://reactnative.dev/docs/view#accessibilityliveregion

###### Inherited from

```ts
ViewProps.accessibilityLiveRegion
```

##### accessibilityRespondsToUserInteraction?

```ts
readonly optional accessibilityRespondsToUserInteraction?: boolean;
```

Blocks the user from interacting with the component through keyboard while still allowing
screen reader to interact with it if this View is still accessible.

###### Platform

ios

###### Inherited from

```ts
ViewProps.accessibilityRespondsToUserInteraction
```

##### accessibilityRole?

```ts
readonly optional accessibilityRole?: string;
```

Indicates to accessibility services to treat UI component like a specific role.

###### Inherited from

```ts
ViewProps.accessibilityRole
```

##### accessibilityShowsLargeContentViewer?

```ts
readonly optional accessibilityShowsLargeContentViewer?: boolean;
```

###### Platform

ios

See https://reactnative.dev/docs/view#accessibilityshowslargecontentviewer

###### Inherited from

```ts
ViewProps.accessibilityShowsLargeContentViewer
```

##### accessibilityState?

```ts
readonly optional accessibilityState?: AccessibilityState;
```

Indicates to accessibility services that UI Component is in a specific State.

###### Inherited from

```ts
ViewProps.accessibilityState
```

##### accessibilityValue?

```ts
readonly optional accessibilityValue?: Readonly<{
  max?: number;
  min?: number;
  now?: number;
  text?: string;
}>;
```

###### Inherited from

```ts
ViewProps.accessibilityValue
```

##### accessibilityViewIsModal?

```ts
readonly optional accessibilityViewIsModal?: boolean;
```

A value indicating whether VoiceOver should ignore the elements
within views that are siblings of the receiver.
Default is `false`.

###### Platform

ios

See https://reactnative.dev/docs/view#accessibilityviewismodal

###### Inherited from

```ts
ViewProps.accessibilityViewIsModal
```

##### accessible?

```ts
readonly optional accessible?: boolean;
```

When `true`, indicates that the view is an accessibility element.
By default, all the touchable elements are accessible.

See https://reactnative.dev/docs/view#accessible

###### Inherited from

```ts
ViewProps.accessible
```

##### aria-busy?

```ts
readonly optional aria-busy?: boolean;
```

alias for accessibilityState

see https://reactnative.dev/docs/accessibility#accessibilitystate

###### Inherited from

```ts
ViewProps.aria-busy
```

##### aria-checked?

```ts
readonly optional aria-checked?: boolean | "mixed";
```

###### Inherited from

```ts
ViewProps.aria-checked
```

##### aria-disabled?

```ts
readonly optional aria-disabled?: boolean;
```

###### Inherited from

```ts
ViewProps.aria-disabled
```

##### aria-expanded?

```ts
readonly optional aria-expanded?: boolean;
```

###### Inherited from

```ts
ViewProps.aria-expanded
```

##### aria-hidden?

```ts
readonly optional aria-hidden?: boolean;
```

A value indicating whether the accessibility elements contained within
this accessibility element are hidden.

See https://reactnative.dev/docs/view#aria-hidden

###### Inherited from

```ts
ViewProps.aria-hidden
```

##### aria-label?

```ts
readonly optional aria-label?: string;
```

Alias for accessibilityLabel  https://reactnative.dev/docs/view#accessibilitylabel
https://github.com/facebook/react-native/issues/34424

###### Inherited from

```ts
ViewProps.aria-label
```

##### aria-labelledby?

```ts
readonly optional aria-labelledby?: string;
```

Identifies the element that labels the element it is applied to. When the assistive technology focuses on the component with this props,
the text is read aloud. The value should should match the nativeID of the related element.

###### Platform

android

###### Inherited from

```ts
ViewProps.aria-labelledby
```

##### aria-live?

```ts
readonly optional aria-live?: "polite" | "assertive" | "off";
```

Indicates to accessibility services whether the user should be notified
when this view changes. Works for Android API >= 19 only.

###### Platform

android

See https://reactnative.dev/docs/view#accessibilityliveregion

###### Inherited from

```ts
ViewProps.aria-live
```

##### aria-modal?

```ts
readonly optional aria-modal?: boolean;
```

The aria-modal attribute indicates content contained within a modal with aria-modal="true"
should be accessible to the user.
Default is `false`.

###### Platform

ios

###### Inherited from

```ts
ViewProps.aria-modal
```

##### aria-selected?

```ts
readonly optional aria-selected?: boolean;
```

###### Inherited from

```ts
ViewProps.aria-selected
```

##### aria-valuemax?

```ts
readonly optional aria-valuemax?: number;
```

alias for accessibilityState
It represents textual description of a component's value, or for range-based components, such as sliders and progress bars.

###### Inherited from

```ts
ViewProps.aria-valuemax
```

##### aria-valuemin?

```ts
readonly optional aria-valuemin?: number;
```

###### Inherited from

```ts
ViewProps.aria-valuemin
```

##### aria-valuenow?

```ts
readonly optional aria-valuenow?: number;
```

###### Inherited from

```ts
ViewProps.aria-valuenow
```

##### aria-valuetext?

```ts
readonly optional aria-valuetext?: string;
```

###### Inherited from

```ts
ViewProps.aria-valuetext
```

##### aspectMode?

```ts
optional aspectMode?: AspectMode;
```

How the video fills the view bounds. Defaults to 'fill'.

##### children?

```ts
readonly optional children?: ReactNode;
```

###### Inherited from

```ts
ViewProps.children
```

##### collapsable?

```ts
readonly optional collapsable?: boolean;
```

Views that are only used to layout their children or otherwise don't draw
anything may be automatically removed from the native hierarchy as an
optimization. Set this property to `false` to disable this optimization and
ensure that this `View` exists in the native view hierarchy.

See https://reactnative.dev/docs/view#collapsable

###### Inherited from

```ts
ViewProps.collapsable
```

##### collapsableChildren?

```ts
readonly optional collapsableChildren?: boolean;
```

Setting to false prevents direct children of the view from being removed
from the native view hierarchy, similar to the effect of setting
`collapsable={false}` on each child.

###### Inherited from

```ts
ViewProps.collapsableChildren
```

##### experimental\_accessibilityOrder?

```ts
readonly optional experimental_accessibilityOrder?: string[];
```

Defines the order in which descendant elements receive accessibility focus.
The elements in the array represent nativeID values for the respective
descendant elements.

###### Inherited from

```ts
ViewProps.experimental_accessibilityOrder
```

##### focusable?

```ts
readonly optional focusable?: boolean;
```

Whether this `View` should be focusable with a non-touch input device, eg. receive focus with a hardware keyboard.

###### Platform

android

###### Inherited from

```ts
ViewProps.focusable
```

##### ~~hasTVPreferredFocus?~~

```ts
readonly optional hasTVPreferredFocus?: boolean;
```

Whether to force the Android TV focus engine to move focus to this view.

###### Platform

android

###### Deprecated

Use `focusable` instead

###### Inherited from

```ts
ViewProps.hasTVPreferredFocus
```

##### hitSlop?

```ts
readonly optional hitSlop?: RectOrSize;
```

This defines how far a touch event can start away from the view.
Typical interface guidelines recommend touch targets that are at least
30 - 40 points/density-independent pixels.

> The touch area never extends past the parent view bounds and the Z-index
> of sibling views always takes precedence if a touch hits two overlapping
> views.

See https://reactnative.dev/docs/view#hitslop

###### Inherited from

```ts
ViewProps.hitSlop
```

##### id?

```ts
readonly optional id?: string;
```

Used to locate this view from native classes. Has precedence over `nativeID` prop.

> This disables the 'layout-only view removal' optimization for this view!

See https://reactnative.dev/docs/view#id

###### Inherited from

```ts
ViewProps.id
```

##### importantForAccessibility?

```ts
readonly optional importantForAccessibility?: "auto" | "yes" | "no" | "no-hide-descendants";
```

Controls how view is important for accessibility which is if it
fires accessibility events and if it is reported to accessibility services
that query the screen. Works for Android only.

###### Platform

android

See https://reactnative.dev/docs/view#importantforaccessibility

###### Inherited from

```ts
ViewProps.importantForAccessibility
```

##### mirror?

```ts
optional mirror?: boolean;
```

Horizontally mirror the preview. Defaults to true.

##### nativeBackgroundAndroid?

```ts
readonly optional nativeBackgroundAndroid?: AndroidDrawable;
```

###### Inherited from

```ts
ViewProps.nativeBackgroundAndroid
```

##### nativeForegroundAndroid?

```ts
readonly optional nativeForegroundAndroid?: AndroidDrawable;
```

###### Inherited from

```ts
ViewProps.nativeForegroundAndroid
```

##### nativeID?

```ts
readonly optional nativeID?: string;
```

Used to locate this view from native classes.

> This disables the 'layout-only view removal' optimization for this view!

See https://reactnative.dev/docs/view#nativeid

###### Inherited from

```ts
ViewProps.nativeID
```

##### needsOffscreenAlphaCompositing?

```ts
readonly optional needsOffscreenAlphaCompositing?: boolean;
```

Whether this `View` needs to rendered offscreen and composited with an
alpha in order to preserve 100% correct colors and blending behavior.

See https://reactnative.dev/docs/view#needsoffscreenalphacompositing

###### Inherited from

```ts
ViewProps.needsOffscreenAlphaCompositing
```

##### nextFocusDown?

```ts
readonly optional nextFocusDown?: number;
```

TV next focus down (see documentation for the View component).

###### Platform

android

###### Inherited from

```ts
ViewProps.nextFocusDown
```

##### nextFocusForward?

```ts
readonly optional nextFocusForward?: number;
```

TV next focus forward (see documentation for the View component).

###### Platform

android

###### Inherited from

```ts
ViewProps.nextFocusForward
```

##### nextFocusLeft?

```ts
readonly optional nextFocusLeft?: number;
```

TV next focus left (see documentation for the View component).

###### Platform

android

###### Inherited from

```ts
ViewProps.nextFocusLeft
```

##### nextFocusRight?

```ts
readonly optional nextFocusRight?: number;
```

TV next focus right (see documentation for the View component).

###### Platform

android

###### Inherited from

```ts
ViewProps.nextFocusRight
```

##### nextFocusUp?

```ts
readonly optional nextFocusUp?: number;
```

TV next focus up (see documentation for the View component).

###### Platform

android

###### Inherited from

```ts
ViewProps.nextFocusUp
```

##### onAccessibilityAction?

```ts
readonly optional onAccessibilityAction?: (event) => unknown;
```

When `accessible` is true, the system will try to invoke this function
when the user performs an accessibility custom action.

###### Parameters

###### event

`AccessibilityActionEvent`

###### Returns

`unknown`

###### Inherited from

```ts
ViewProps.onAccessibilityAction
```

##### onAccessibilityEscape?

```ts
readonly optional onAccessibilityEscape?: () => unknown;
```

When `accessible` is `true`, the system will invoke this function when the
user performs the escape gesture.

See https://reactnative.dev/docs/view#onaccessibilityescape

###### Returns

`unknown`

###### Inherited from

```ts
ViewProps.onAccessibilityEscape
```

##### onAccessibilityTap?

```ts
readonly optional onAccessibilityTap?: () => unknown;
```

When `accessible` is true, the system will try to invoke this function
when the user performs accessibility tap gesture.

See https://reactnative.dev/docs/view#onaccessibilitytap

###### Returns

`unknown`

###### Inherited from

```ts
ViewProps.onAccessibilityTap
```

##### onBlur?

```ts
readonly optional onBlur?: (event) => void;
```

###### Parameters

###### event

`BlurEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onBlur
```

##### onBlurCapture?

```ts
readonly optional onBlurCapture?: (event) => void;
```

###### Parameters

###### event

`BlurEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onBlurCapture
```

##### onClick?

```ts
readonly optional onClick?: (event) => unknown;
```

The action to perform when this `View` is clicked on by a non-touch click, eg. enter key on a hardware keyboard.

###### Parameters

###### event

`GestureResponderEvent`

###### Returns

`unknown`

###### Platform

android

###### Inherited from

```ts
ViewProps.onClick
```

##### onClickCapture?

```ts
readonly optional onClickCapture?: (event) => void;
```

###### Parameters

###### event

`PointerEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onClickCapture
```

##### onFocus?

```ts
readonly optional onFocus?: (event) => void;
```

###### Parameters

###### event

`FocusEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onFocus
```

##### onFocusCapture?

```ts
readonly optional onFocusCapture?: (event) => void;
```

###### Parameters

###### event

`FocusEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onFocusCapture
```

##### onGotPointerCapture?

```ts
readonly optional onGotPointerCapture?: (e) => void;
```

###### Parameters

###### e

`PointerEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onGotPointerCapture
```

##### onGotPointerCaptureCapture?

```ts
readonly optional onGotPointerCaptureCapture?: (e) => void;
```

###### Parameters

###### e

`PointerEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onGotPointerCaptureCapture
```

##### onKeyDown?

```ts
readonly optional onKeyDown?: (event) => void;
```

###### Parameters

###### event

`KeyDownEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onKeyDown
```

##### onKeyDownCapture?

```ts
readonly optional onKeyDownCapture?: (event) => void;
```

###### Parameters

###### event

`KeyDownEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onKeyDownCapture
```

##### onKeyUp?

```ts
readonly optional onKeyUp?: (event) => void;
```

###### Parameters

###### event

`KeyUpEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onKeyUp
```

##### onKeyUpCapture?

```ts
readonly optional onKeyUpCapture?: (event) => void;
```

###### Parameters

###### event

`KeyUpEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onKeyUpCapture
```

##### onLayout?

```ts
readonly optional onLayout?: (event) => unknown;
```

Invoked on mount and layout changes with:

`{nativeEvent: { layout: {x, y, width, height}}}`

This event is fired immediately once the layout has been calculated, but
the new layout may not yet be reflected on the screen at the time the
event is received, especially if a layout animation is in progress.

See https://reactnative.dev/docs/view#onlayout

###### Parameters

###### event

`LayoutChangeEvent`

###### Returns

`unknown`

###### Inherited from

```ts
ViewProps.onLayout
```

##### onLostPointerCapture?

```ts
readonly optional onLostPointerCapture?: (e) => void;
```

###### Parameters

###### e

`PointerEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onLostPointerCapture
```

##### onLostPointerCaptureCapture?

```ts
readonly optional onLostPointerCaptureCapture?: (e) => void;
```

###### Parameters

###### e

`PointerEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onLostPointerCaptureCapture
```

##### onMagicTap?

```ts
readonly optional onMagicTap?: () => unknown;
```

When `accessible` is `true`, the system will invoke this function when the
user performs the magic tap gesture.

See https://reactnative.dev/docs/view#onmagictap

###### Returns

`unknown`

###### Inherited from

```ts
ViewProps.onMagicTap
```

##### onMouseEnter?

```ts
readonly optional onMouseEnter?: (event) => void;
```

###### Parameters

###### event

`MouseEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onMouseEnter
```

##### onMouseLeave?

```ts
readonly optional onMouseLeave?: (event) => void;
```

###### Parameters

###### event

`MouseEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onMouseLeave
```

##### onMoveShouldSetResponder?

```ts
readonly optional onMoveShouldSetResponder?: (e) => boolean;
```

Does this view want to "claim" touch responsiveness? This is called for
every touch move on the `View` when it is not the responder.

`View.props.onMoveShouldSetResponder: (event) => [true | false]`, where
`event` is a synthetic touch event as described above.

See https://reactnative.dev/docs/view#onmoveshouldsetresponder

###### Parameters

###### e

`GestureResponderEvent`

###### Returns

`boolean`

###### Inherited from

```ts
ViewProps.onMoveShouldSetResponder
```

##### onMoveShouldSetResponderCapture?

```ts
readonly optional onMoveShouldSetResponderCapture?: (e) => boolean;
```

If a parent `View` wants to prevent a child `View` from becoming responder
on a move, it should have this handler which returns `true`.

`View.props.onMoveShouldSetResponderCapture: (event) => [true | false]`,
where `event` is a synthetic touch event as described above.

See https://reactnative.dev/docs/view#onMoveShouldsetrespondercapture

###### Parameters

###### e

`GestureResponderEvent`

###### Returns

`boolean`

###### Inherited from

```ts
ViewProps.onMoveShouldSetResponderCapture
```

##### onPointerCancel?

```ts
readonly optional onPointerCancel?: (e) => void;
```

###### Parameters

###### e

`PointerEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onPointerCancel
```

##### onPointerCancelCapture?

```ts
readonly optional onPointerCancelCapture?: (e) => void;
```

###### Parameters

###### e

`PointerEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onPointerCancelCapture
```

##### onPointerDown?

```ts
readonly optional onPointerDown?: (e) => void;
```

###### Parameters

###### e

`PointerEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onPointerDown
```

##### onPointerDownCapture?

```ts
readonly optional onPointerDownCapture?: (e) => void;
```

###### Parameters

###### e

`PointerEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onPointerDownCapture
```

##### onPointerEnter?

```ts
readonly optional onPointerEnter?: (event) => void;
```

###### Parameters

###### event

`PointerEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onPointerEnter
```

##### onPointerEnterCapture?

```ts
readonly optional onPointerEnterCapture?: (event) => void;
```

###### Parameters

###### event

`PointerEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onPointerEnterCapture
```

##### onPointerLeave?

```ts
readonly optional onPointerLeave?: (event) => void;
```

###### Parameters

###### event

`PointerEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onPointerLeave
```

##### onPointerLeaveCapture?

```ts
readonly optional onPointerLeaveCapture?: (event) => void;
```

###### Parameters

###### event

`PointerEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onPointerLeaveCapture
```

##### onPointerMove?

```ts
readonly optional onPointerMove?: (event) => void;
```

###### Parameters

###### event

`PointerEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onPointerMove
```

##### onPointerMoveCapture?

```ts
readonly optional onPointerMoveCapture?: (event) => void;
```

###### Parameters

###### event

`PointerEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onPointerMoveCapture
```

##### onPointerOut?

```ts
readonly optional onPointerOut?: (e) => void;
```

###### Parameters

###### e

`PointerEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onPointerOut
```

##### onPointerOutCapture?

```ts
readonly optional onPointerOutCapture?: (e) => void;
```

###### Parameters

###### e

`PointerEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onPointerOutCapture
```

##### onPointerOver?

```ts
readonly optional onPointerOver?: (e) => void;
```

###### Parameters

###### e

`PointerEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onPointerOver
```

##### onPointerOverCapture?

```ts
readonly optional onPointerOverCapture?: (e) => void;
```

###### Parameters

###### e

`PointerEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onPointerOverCapture
```

##### onPointerUp?

```ts
readonly optional onPointerUp?: (e) => void;
```

###### Parameters

###### e

`PointerEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onPointerUp
```

##### onPointerUpCapture?

```ts
readonly optional onPointerUpCapture?: (e) => void;
```

###### Parameters

###### e

`PointerEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onPointerUpCapture
```

##### onResponderEnd?

```ts
readonly optional onResponderEnd?: (e) => void;
```

###### Parameters

###### e

`GestureResponderEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onResponderEnd
```

##### onResponderGrant?

```ts
readonly optional onResponderGrant?: (e) => boolean | void;
```

The View is now responding for touch events. This is the time to highlight
and show the user what is happening.

`View.props.onResponderGrant: (event) => {}`, where `event` is a synthetic
touch event as described above.

Return true from this callback to prevent any other native components from
becoming responder until this responder terminates (Android-only).

See https://reactnative.dev/docs/view#onrespondergrant

###### Parameters

###### e

`GestureResponderEvent`

###### Returns

`boolean` \| `void`

###### Inherited from

```ts
ViewProps.onResponderGrant
```

##### onResponderMove?

```ts
readonly optional onResponderMove?: (e) => void;
```

The user is moving their finger.

`View.props.onResponderMove: (event) => {}`, where `event` is a synthetic
touch event as described above.

See https://reactnative.dev/docs/view#onrespondermove

###### Parameters

###### e

`GestureResponderEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onResponderMove
```

##### onResponderReject?

```ts
readonly optional onResponderReject?: (e) => void;
```

Another responder is already active and will not release it to that `View`
asking to be the responder.

`View.props.onResponderReject: (event) => {}`, where `event` is a
synthetic touch event as described above.

See https://reactnative.dev/docs/view#onresponderreject

###### Parameters

###### e

`GestureResponderEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onResponderReject
```

##### onResponderRelease?

```ts
readonly optional onResponderRelease?: (e) => void;
```

Fired at the end of the touch.

`View.props.onResponderRelease: (event) => {}`, where `event` is a
synthetic touch event as described above.

See https://reactnative.dev/docs/view#onresponderrelease

###### Parameters

###### e

`GestureResponderEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onResponderRelease
```

##### onResponderStart?

```ts
readonly optional onResponderStart?: (e) => void;
```

###### Parameters

###### e

`GestureResponderEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onResponderStart
```

##### onResponderTerminate?

```ts
readonly optional onResponderTerminate?: (e) => void;
```

The responder has been taken from the `View`. Might be taken by other
views after a call to `onResponderTerminationRequest`, or might be taken
by the OS without asking (e.g., happens with control center/ notification
center on iOS)

`View.props.onResponderTerminate: (event) => {}`, where `event` is a
synthetic touch event as described above.

See https://reactnative.dev/docs/view#onresponderterminate

###### Parameters

###### e

`GestureResponderEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onResponderTerminate
```

##### onResponderTerminationRequest?

```ts
readonly optional onResponderTerminationRequest?: (e) => boolean;
```

Some other `View` wants to become responder and is asking this `View` to
release its responder. Returning `true` allows its release.

`View.props.onResponderTerminationRequest: (event) => {}`, where `event`
is a synthetic touch event as described above.

See https://reactnative.dev/docs/view#onresponderterminationrequest

###### Parameters

###### e

`GestureResponderEvent`

###### Returns

`boolean`

###### Inherited from

```ts
ViewProps.onResponderTerminationRequest
```

##### onStartShouldSetResponder?

```ts
readonly optional onStartShouldSetResponder?: (e) => boolean;
```

Does this view want to become responder on the start of a touch?

`View.props.onStartShouldSetResponder: (event) => [true | false]`, where
`event` is a synthetic touch event as described above.

See https://reactnative.dev/docs/view#onstartshouldsetresponder

###### Parameters

###### e

`GestureResponderEvent`

###### Returns

`boolean`

###### Inherited from

```ts
ViewProps.onStartShouldSetResponder
```

##### onStartShouldSetResponderCapture?

```ts
readonly optional onStartShouldSetResponderCapture?: (e) => boolean;
```

If a parent `View` wants to prevent a child `View` from becoming responder
on a touch start, it should have this handler which returns `true`.

`View.props.onStartShouldSetResponderCapture: (event) => [true | false]`,
where `event` is a synthetic touch event as described above.

See https://reactnative.dev/docs/view#onstartshouldsetrespondercapture

###### Parameters

###### e

`GestureResponderEvent`

###### Returns

`boolean`

###### Inherited from

```ts
ViewProps.onStartShouldSetResponderCapture
```

##### onTouchCancel?

```ts
readonly optional onTouchCancel?: (e) => void;
```

###### Parameters

###### e

`GestureResponderEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onTouchCancel
```

##### onTouchCancelCapture?

```ts
readonly optional onTouchCancelCapture?: (e) => void;
```

###### Parameters

###### e

`GestureResponderEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onTouchCancelCapture
```

##### onTouchEnd?

```ts
readonly optional onTouchEnd?: (e) => void;
```

###### Parameters

###### e

`GestureResponderEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onTouchEnd
```

##### onTouchEndCapture?

```ts
readonly optional onTouchEndCapture?: (e) => void;
```

###### Parameters

###### e

`GestureResponderEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onTouchEndCapture
```

##### onTouchMove?

```ts
readonly optional onTouchMove?: (e) => void;
```

###### Parameters

###### e

`GestureResponderEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onTouchMove
```

##### onTouchMoveCapture?

```ts
readonly optional onTouchMoveCapture?: (e) => void;
```

###### Parameters

###### e

`GestureResponderEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onTouchMoveCapture
```

##### onTouchStart?

```ts
readonly optional onTouchStart?: (e) => void;
```

###### Parameters

###### e

`GestureResponderEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onTouchStart
```

##### onTouchStartCapture?

```ts
readonly optional onTouchStartCapture?: (e) => void;
```

###### Parameters

###### e

`GestureResponderEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onTouchStartCapture
```

##### pointerEvents?

```ts
readonly optional pointerEvents?: "none" | "auto" | "box-none" | "box-only";
```

Controls whether the `View` can be the target of touch events.

See https://reactnative.dev/docs/view#pointerevents

###### Inherited from

```ts
ViewProps.pointerEvents
```

##### removeClippedSubviews?

```ts
readonly optional removeClippedSubviews?: boolean;
```

This is a special performance property exposed by `RCTView` and is useful
for scrolling content when there are many subviews, most of which are
offscreen. For this property to be effective, it must be applied to a
view that contains many subviews that extend outside its bound. The
subviews must also have `overflow: hidden`, as should the containing view
(or one of its superviews).

See https://reactnative.dev/docs/view#removeclippedsubviews

###### Inherited from

```ts
ViewProps.removeClippedSubviews
```

##### renderToHardwareTextureAndroid?

```ts
readonly optional renderToHardwareTextureAndroid?: boolean;
```

Whether this `View` should render itself (and all of its children) into a
single hardware texture on the GPU.

###### Platform

android

See https://reactnative.dev/docs/view#rendertohardwaretextureandroid

###### Inherited from

```ts
ViewProps.renderToHardwareTextureAndroid
```

##### role?

```ts
readonly optional role?: Role;
```

Alias for accessibilityRole

###### Inherited from

```ts
ViewProps.role
```

##### screenReaderFocusable?

```ts
readonly optional screenReaderFocusable?: boolean;
```

Enables the view to be screen reader focusable, not keyboard focusable. This has lower priority
than focusable or accessible props.

###### Platform

android

###### Inherited from

```ts
ViewProps.screenReaderFocusable
```

##### shouldRasterizeIOS?

```ts
readonly optional shouldRasterizeIOS?: boolean;
```

Whether this `View` should be rendered as a bitmap before compositing.

###### Platform

ios

See https://reactnative.dev/docs/view#shouldrasterizeios

###### Inherited from

```ts
ViewProps.shouldRasterizeIOS
```

##### source?

```ts
optional source?: "camera" | string & object | "screen";
```

Local device source. Defaults to 'camera'.
Extensibility point for 'screen' or a device urn.

##### style?

```ts
readonly optional style?: ____ViewStyleProp_Internal;
```

###### Inherited from

```ts
ViewProps.style
```

##### tabIndex?

```ts
readonly optional tabIndex?: 0 | -1;
```

Indicates whether this `View` should be focusable with a non-touch input device, eg. receive focus with a hardware keyboard.
See https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex
for more details.

Supports the following values:
-  0 (View is focusable)
- -1 (View is not focusable)

###### Platform

android

###### Inherited from

```ts
ViewProps.tabIndex
```

##### testID?

```ts
readonly optional testID?: string;
```

Used to locate this view in end-to-end tests.

> This disables the 'layout-only view removal' optimization for this view!

See https://reactnative.dev/docs/view#testid

###### Inherited from

```ts
ViewProps.testID
```

***

### IVSParticipantInfo

#### Properties

##### attributes

```ts
attributes: Record<string, string>;
```

##### isLocal

```ts
isLocal: boolean;
```

##### participantId

```ts
participantId: string;
```

##### publishState

```ts
publishState: ParticipantPublishState;
```

##### streams

```ts
streams: IVSStageStreamInfo[];
```

##### subscribeState

```ts
subscribeState: ParticipantSubscribeState;
```

##### userId

```ts
userId: string;
```

***

### IVSParticipantVideoViewProps

#### Extends

- `ViewProps`

#### Properties

##### accessibilityActions?

```ts
readonly optional accessibilityActions?: readonly Readonly<{
  label?: string;
  name: string;
}>[];
```

Provides an array of custom actions available for accessibility.

###### Inherited from

```ts
ViewProps.accessibilityActions
```

##### accessibilityElementsHidden?

```ts
readonly optional accessibilityElementsHidden?: boolean;
```

A value indicating whether the accessibility elements contained within
this accessibility element are hidden.

###### Platform

ios

See https://reactnative.dev/docs/view#accessibilityElementsHidden

###### Inherited from

```ts
ViewProps.accessibilityElementsHidden
```

##### accessibilityHint?

```ts
readonly optional accessibilityHint?: string;
```

An accessibility hint helps users understand what will happen when they perform
an action on the accessibility element when that result is not obvious from the
accessibility label.

See https://reactnative.dev/docs/view#accessibilityHint

###### Inherited from

```ts
ViewProps.accessibilityHint
```

##### accessibilityIgnoresInvertColors?

```ts
readonly optional accessibilityIgnoresInvertColors?: boolean;
```

Prevents view from being inverted if set to true and color inversion is turned on.

###### Platform

ios

###### Inherited from

```ts
ViewProps.accessibilityIgnoresInvertColors
```

##### accessibilityLabel?

```ts
readonly optional accessibilityLabel?: string;
```

Overrides the text that's read by the screen reader when the user interacts
with the element. By default, the label is constructed by traversing all
the children and accumulating all the `Text` nodes separated by space.

See https://reactnative.dev/docs/view#accessibilitylabel

###### Inherited from

```ts
ViewProps.accessibilityLabel
```

##### accessibilityLabelledBy?

```ts
readonly optional accessibilityLabelledBy?: string | string[];
```

Identifies the element that labels the element it is applied to. When the assistive technology focuses on the component with this props,
the text is read aloud. The value should should match the nativeID of the related element.

###### Platform

android

###### Inherited from

```ts
ViewProps.accessibilityLabelledBy
```

##### accessibilityLanguage?

```ts
readonly optional accessibilityLanguage?: string;
```

Indicates to the accessibility services that the UI component is in
a specific language. The provided string should be formatted following
the BCP 47 specification (https://www.rfc-editor.org/info/bcp47).

###### Platform

ios

###### Inherited from

```ts
ViewProps.accessibilityLanguage
```

##### accessibilityLargeContentTitle?

```ts
readonly optional accessibilityLargeContentTitle?: string;
```

###### Platform

ios

See https://reactnative.dev/docs/view#accessibilitylargecontenttitle

###### Inherited from

```ts
ViewProps.accessibilityLargeContentTitle
```

##### accessibilityLiveRegion?

```ts
readonly optional accessibilityLiveRegion?: "none" | "polite" | "assertive";
```

Indicates to accessibility services whether the user should be notified
when this view changes. Works for Android API >= 19 only.

###### Platform

android

See https://reactnative.dev/docs/view#accessibilityliveregion

###### Inherited from

```ts
ViewProps.accessibilityLiveRegion
```

##### accessibilityRespondsToUserInteraction?

```ts
readonly optional accessibilityRespondsToUserInteraction?: boolean;
```

Blocks the user from interacting with the component through keyboard while still allowing
screen reader to interact with it if this View is still accessible.

###### Platform

ios

###### Inherited from

```ts
ViewProps.accessibilityRespondsToUserInteraction
```

##### accessibilityRole?

```ts
readonly optional accessibilityRole?: string;
```

Indicates to accessibility services to treat UI component like a specific role.

###### Inherited from

```ts
ViewProps.accessibilityRole
```

##### accessibilityShowsLargeContentViewer?

```ts
readonly optional accessibilityShowsLargeContentViewer?: boolean;
```

###### Platform

ios

See https://reactnative.dev/docs/view#accessibilityshowslargecontentviewer

###### Inherited from

```ts
ViewProps.accessibilityShowsLargeContentViewer
```

##### accessibilityState?

```ts
readonly optional accessibilityState?: AccessibilityState;
```

Indicates to accessibility services that UI Component is in a specific State.

###### Inherited from

```ts
ViewProps.accessibilityState
```

##### accessibilityValue?

```ts
readonly optional accessibilityValue?: Readonly<{
  max?: number;
  min?: number;
  now?: number;
  text?: string;
}>;
```

###### Inherited from

```ts
ViewProps.accessibilityValue
```

##### accessibilityViewIsModal?

```ts
readonly optional accessibilityViewIsModal?: boolean;
```

A value indicating whether VoiceOver should ignore the elements
within views that are siblings of the receiver.
Default is `false`.

###### Platform

ios

See https://reactnative.dev/docs/view#accessibilityviewismodal

###### Inherited from

```ts
ViewProps.accessibilityViewIsModal
```

##### accessible?

```ts
readonly optional accessible?: boolean;
```

When `true`, indicates that the view is an accessibility element.
By default, all the touchable elements are accessible.

See https://reactnative.dev/docs/view#accessible

###### Inherited from

```ts
ViewProps.accessible
```

##### aria-busy?

```ts
readonly optional aria-busy?: boolean;
```

alias for accessibilityState

see https://reactnative.dev/docs/accessibility#accessibilitystate

###### Inherited from

```ts
ViewProps.aria-busy
```

##### aria-checked?

```ts
readonly optional aria-checked?: boolean | "mixed";
```

###### Inherited from

```ts
ViewProps.aria-checked
```

##### aria-disabled?

```ts
readonly optional aria-disabled?: boolean;
```

###### Inherited from

```ts
ViewProps.aria-disabled
```

##### aria-expanded?

```ts
readonly optional aria-expanded?: boolean;
```

###### Inherited from

```ts
ViewProps.aria-expanded
```

##### aria-hidden?

```ts
readonly optional aria-hidden?: boolean;
```

A value indicating whether the accessibility elements contained within
this accessibility element are hidden.

See https://reactnative.dev/docs/view#aria-hidden

###### Inherited from

```ts
ViewProps.aria-hidden
```

##### aria-label?

```ts
readonly optional aria-label?: string;
```

Alias for accessibilityLabel  https://reactnative.dev/docs/view#accessibilitylabel
https://github.com/facebook/react-native/issues/34424

###### Inherited from

```ts
ViewProps.aria-label
```

##### aria-labelledby?

```ts
readonly optional aria-labelledby?: string;
```

Identifies the element that labels the element it is applied to. When the assistive technology focuses on the component with this props,
the text is read aloud. The value should should match the nativeID of the related element.

###### Platform

android

###### Inherited from

```ts
ViewProps.aria-labelledby
```

##### aria-live?

```ts
readonly optional aria-live?: "polite" | "assertive" | "off";
```

Indicates to accessibility services whether the user should be notified
when this view changes. Works for Android API >= 19 only.

###### Platform

android

See https://reactnative.dev/docs/view#accessibilityliveregion

###### Inherited from

```ts
ViewProps.aria-live
```

##### aria-modal?

```ts
readonly optional aria-modal?: boolean;
```

The aria-modal attribute indicates content contained within a modal with aria-modal="true"
should be accessible to the user.
Default is `false`.

###### Platform

ios

###### Inherited from

```ts
ViewProps.aria-modal
```

##### aria-selected?

```ts
readonly optional aria-selected?: boolean;
```

###### Inherited from

```ts
ViewProps.aria-selected
```

##### aria-valuemax?

```ts
readonly optional aria-valuemax?: number;
```

alias for accessibilityState
It represents textual description of a component's value, or for range-based components, such as sliders and progress bars.

###### Inherited from

```ts
ViewProps.aria-valuemax
```

##### aria-valuemin?

```ts
readonly optional aria-valuemin?: number;
```

###### Inherited from

```ts
ViewProps.aria-valuemin
```

##### aria-valuenow?

```ts
readonly optional aria-valuenow?: number;
```

###### Inherited from

```ts
ViewProps.aria-valuenow
```

##### aria-valuetext?

```ts
readonly optional aria-valuetext?: string;
```

###### Inherited from

```ts
ViewProps.aria-valuetext
```

##### aspectMode?

```ts
optional aspectMode?: AspectMode;
```

How the video fills the view bounds. Defaults to 'fill'.

##### children?

```ts
readonly optional children?: ReactNode;
```

###### Inherited from

```ts
ViewProps.children
```

##### collapsable?

```ts
readonly optional collapsable?: boolean;
```

Views that are only used to layout their children or otherwise don't draw
anything may be automatically removed from the native hierarchy as an
optimization. Set this property to `false` to disable this optimization and
ensure that this `View` exists in the native view hierarchy.

See https://reactnative.dev/docs/view#collapsable

###### Inherited from

```ts
ViewProps.collapsable
```

##### collapsableChildren?

```ts
readonly optional collapsableChildren?: boolean;
```

Setting to false prevents direct children of the view from being removed
from the native view hierarchy, similar to the effect of setting
`collapsable={false}` on each child.

###### Inherited from

```ts
ViewProps.collapsableChildren
```

##### experimental\_accessibilityOrder?

```ts
readonly optional experimental_accessibilityOrder?: string[];
```

Defines the order in which descendant elements receive accessibility focus.
The elements in the array represent nativeID values for the respective
descendant elements.

###### Inherited from

```ts
ViewProps.experimental_accessibilityOrder
```

##### focusable?

```ts
readonly optional focusable?: boolean;
```

Whether this `View` should be focusable with a non-touch input device, eg. receive focus with a hardware keyboard.

###### Platform

android

###### Inherited from

```ts
ViewProps.focusable
```

##### ~~hasTVPreferredFocus?~~

```ts
readonly optional hasTVPreferredFocus?: boolean;
```

Whether to force the Android TV focus engine to move focus to this view.

###### Platform

android

###### Deprecated

Use `focusable` instead

###### Inherited from

```ts
ViewProps.hasTVPreferredFocus
```

##### hitSlop?

```ts
readonly optional hitSlop?: RectOrSize;
```

This defines how far a touch event can start away from the view.
Typical interface guidelines recommend touch targets that are at least
30 - 40 points/density-independent pixels.

> The touch area never extends past the parent view bounds and the Z-index
> of sibling views always takes precedence if a touch hits two overlapping
> views.

See https://reactnative.dev/docs/view#hitslop

###### Inherited from

```ts
ViewProps.hitSlop
```

##### id?

```ts
readonly optional id?: string;
```

Used to locate this view from native classes. Has precedence over `nativeID` prop.

> This disables the 'layout-only view removal' optimization for this view!

See https://reactnative.dev/docs/view#id

###### Inherited from

```ts
ViewProps.id
```

##### importantForAccessibility?

```ts
readonly optional importantForAccessibility?: "auto" | "yes" | "no" | "no-hide-descendants";
```

Controls how view is important for accessibility which is if it
fires accessibility events and if it is reported to accessibility services
that query the screen. Works for Android only.

###### Platform

android

See https://reactnative.dev/docs/view#importantforaccessibility

###### Inherited from

```ts
ViewProps.importantForAccessibility
```

##### mirror?

```ts
optional mirror?: boolean;
```

Horizontally mirror the video. Defaults to false.

##### nativeBackgroundAndroid?

```ts
readonly optional nativeBackgroundAndroid?: AndroidDrawable;
```

###### Inherited from

```ts
ViewProps.nativeBackgroundAndroid
```

##### nativeForegroundAndroid?

```ts
readonly optional nativeForegroundAndroid?: AndroidDrawable;
```

###### Inherited from

```ts
ViewProps.nativeForegroundAndroid
```

##### nativeID?

```ts
readonly optional nativeID?: string;
```

Used to locate this view from native classes.

> This disables the 'layout-only view removal' optimization for this view!

See https://reactnative.dev/docs/view#nativeid

###### Inherited from

```ts
ViewProps.nativeID
```

##### needsOffscreenAlphaCompositing?

```ts
readonly optional needsOffscreenAlphaCompositing?: boolean;
```

Whether this `View` needs to rendered offscreen and composited with an
alpha in order to preserve 100% correct colors and blending behavior.

See https://reactnative.dev/docs/view#needsoffscreenalphacompositing

###### Inherited from

```ts
ViewProps.needsOffscreenAlphaCompositing
```

##### nextFocusDown?

```ts
readonly optional nextFocusDown?: number;
```

TV next focus down (see documentation for the View component).

###### Platform

android

###### Inherited from

```ts
ViewProps.nextFocusDown
```

##### nextFocusForward?

```ts
readonly optional nextFocusForward?: number;
```

TV next focus forward (see documentation for the View component).

###### Platform

android

###### Inherited from

```ts
ViewProps.nextFocusForward
```

##### nextFocusLeft?

```ts
readonly optional nextFocusLeft?: number;
```

TV next focus left (see documentation for the View component).

###### Platform

android

###### Inherited from

```ts
ViewProps.nextFocusLeft
```

##### nextFocusRight?

```ts
readonly optional nextFocusRight?: number;
```

TV next focus right (see documentation for the View component).

###### Platform

android

###### Inherited from

```ts
ViewProps.nextFocusRight
```

##### nextFocusUp?

```ts
readonly optional nextFocusUp?: number;
```

TV next focus up (see documentation for the View component).

###### Platform

android

###### Inherited from

```ts
ViewProps.nextFocusUp
```

##### onAccessibilityAction?

```ts
readonly optional onAccessibilityAction?: (event) => unknown;
```

When `accessible` is true, the system will try to invoke this function
when the user performs an accessibility custom action.

###### Parameters

###### event

`AccessibilityActionEvent`

###### Returns

`unknown`

###### Inherited from

```ts
ViewProps.onAccessibilityAction
```

##### onAccessibilityEscape?

```ts
readonly optional onAccessibilityEscape?: () => unknown;
```

When `accessible` is `true`, the system will invoke this function when the
user performs the escape gesture.

See https://reactnative.dev/docs/view#onaccessibilityescape

###### Returns

`unknown`

###### Inherited from

```ts
ViewProps.onAccessibilityEscape
```

##### onAccessibilityTap?

```ts
readonly optional onAccessibilityTap?: () => unknown;
```

When `accessible` is true, the system will try to invoke this function
when the user performs accessibility tap gesture.

See https://reactnative.dev/docs/view#onaccessibilitytap

###### Returns

`unknown`

###### Inherited from

```ts
ViewProps.onAccessibilityTap
```

##### onBlur?

```ts
readonly optional onBlur?: (event) => void;
```

###### Parameters

###### event

`BlurEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onBlur
```

##### onBlurCapture?

```ts
readonly optional onBlurCapture?: (event) => void;
```

###### Parameters

###### event

`BlurEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onBlurCapture
```

##### onClick?

```ts
readonly optional onClick?: (event) => unknown;
```

The action to perform when this `View` is clicked on by a non-touch click, eg. enter key on a hardware keyboard.

###### Parameters

###### event

`GestureResponderEvent`

###### Returns

`unknown`

###### Platform

android

###### Inherited from

```ts
ViewProps.onClick
```

##### onClickCapture?

```ts
readonly optional onClickCapture?: (event) => void;
```

###### Parameters

###### event

`PointerEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onClickCapture
```

##### onFocus?

```ts
readonly optional onFocus?: (event) => void;
```

###### Parameters

###### event

`FocusEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onFocus
```

##### onFocusCapture?

```ts
readonly optional onFocusCapture?: (event) => void;
```

###### Parameters

###### event

`FocusEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onFocusCapture
```

##### onGotPointerCapture?

```ts
readonly optional onGotPointerCapture?: (e) => void;
```

###### Parameters

###### e

`PointerEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onGotPointerCapture
```

##### onGotPointerCaptureCapture?

```ts
readonly optional onGotPointerCaptureCapture?: (e) => void;
```

###### Parameters

###### e

`PointerEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onGotPointerCaptureCapture
```

##### onKeyDown?

```ts
readonly optional onKeyDown?: (event) => void;
```

###### Parameters

###### event

`KeyDownEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onKeyDown
```

##### onKeyDownCapture?

```ts
readonly optional onKeyDownCapture?: (event) => void;
```

###### Parameters

###### event

`KeyDownEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onKeyDownCapture
```

##### onKeyUp?

```ts
readonly optional onKeyUp?: (event) => void;
```

###### Parameters

###### event

`KeyUpEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onKeyUp
```

##### onKeyUpCapture?

```ts
readonly optional onKeyUpCapture?: (event) => void;
```

###### Parameters

###### event

`KeyUpEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onKeyUpCapture
```

##### onLayout?

```ts
readonly optional onLayout?: (event) => unknown;
```

Invoked on mount and layout changes with:

`{nativeEvent: { layout: {x, y, width, height}}}`

This event is fired immediately once the layout has been calculated, but
the new layout may not yet be reflected on the screen at the time the
event is received, especially if a layout animation is in progress.

See https://reactnative.dev/docs/view#onlayout

###### Parameters

###### event

`LayoutChangeEvent`

###### Returns

`unknown`

###### Inherited from

```ts
ViewProps.onLayout
```

##### onLostPointerCapture?

```ts
readonly optional onLostPointerCapture?: (e) => void;
```

###### Parameters

###### e

`PointerEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onLostPointerCapture
```

##### onLostPointerCaptureCapture?

```ts
readonly optional onLostPointerCaptureCapture?: (e) => void;
```

###### Parameters

###### e

`PointerEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onLostPointerCaptureCapture
```

##### onMagicTap?

```ts
readonly optional onMagicTap?: () => unknown;
```

When `accessible` is `true`, the system will invoke this function when the
user performs the magic tap gesture.

See https://reactnative.dev/docs/view#onmagictap

###### Returns

`unknown`

###### Inherited from

```ts
ViewProps.onMagicTap
```

##### onMouseEnter?

```ts
readonly optional onMouseEnter?: (event) => void;
```

###### Parameters

###### event

`MouseEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onMouseEnter
```

##### onMouseLeave?

```ts
readonly optional onMouseLeave?: (event) => void;
```

###### Parameters

###### event

`MouseEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onMouseLeave
```

##### onMoveShouldSetResponder?

```ts
readonly optional onMoveShouldSetResponder?: (e) => boolean;
```

Does this view want to "claim" touch responsiveness? This is called for
every touch move on the `View` when it is not the responder.

`View.props.onMoveShouldSetResponder: (event) => [true | false]`, where
`event` is a synthetic touch event as described above.

See https://reactnative.dev/docs/view#onmoveshouldsetresponder

###### Parameters

###### e

`GestureResponderEvent`

###### Returns

`boolean`

###### Inherited from

```ts
ViewProps.onMoveShouldSetResponder
```

##### onMoveShouldSetResponderCapture?

```ts
readonly optional onMoveShouldSetResponderCapture?: (e) => boolean;
```

If a parent `View` wants to prevent a child `View` from becoming responder
on a move, it should have this handler which returns `true`.

`View.props.onMoveShouldSetResponderCapture: (event) => [true | false]`,
where `event` is a synthetic touch event as described above.

See https://reactnative.dev/docs/view#onMoveShouldsetrespondercapture

###### Parameters

###### e

`GestureResponderEvent`

###### Returns

`boolean`

###### Inherited from

```ts
ViewProps.onMoveShouldSetResponderCapture
```

##### onPointerCancel?

```ts
readonly optional onPointerCancel?: (e) => void;
```

###### Parameters

###### e

`PointerEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onPointerCancel
```

##### onPointerCancelCapture?

```ts
readonly optional onPointerCancelCapture?: (e) => void;
```

###### Parameters

###### e

`PointerEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onPointerCancelCapture
```

##### onPointerDown?

```ts
readonly optional onPointerDown?: (e) => void;
```

###### Parameters

###### e

`PointerEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onPointerDown
```

##### onPointerDownCapture?

```ts
readonly optional onPointerDownCapture?: (e) => void;
```

###### Parameters

###### e

`PointerEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onPointerDownCapture
```

##### onPointerEnter?

```ts
readonly optional onPointerEnter?: (event) => void;
```

###### Parameters

###### event

`PointerEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onPointerEnter
```

##### onPointerEnterCapture?

```ts
readonly optional onPointerEnterCapture?: (event) => void;
```

###### Parameters

###### event

`PointerEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onPointerEnterCapture
```

##### onPointerLeave?

```ts
readonly optional onPointerLeave?: (event) => void;
```

###### Parameters

###### event

`PointerEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onPointerLeave
```

##### onPointerLeaveCapture?

```ts
readonly optional onPointerLeaveCapture?: (event) => void;
```

###### Parameters

###### event

`PointerEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onPointerLeaveCapture
```

##### onPointerMove?

```ts
readonly optional onPointerMove?: (event) => void;
```

###### Parameters

###### event

`PointerEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onPointerMove
```

##### onPointerMoveCapture?

```ts
readonly optional onPointerMoveCapture?: (event) => void;
```

###### Parameters

###### event

`PointerEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onPointerMoveCapture
```

##### onPointerOut?

```ts
readonly optional onPointerOut?: (e) => void;
```

###### Parameters

###### e

`PointerEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onPointerOut
```

##### onPointerOutCapture?

```ts
readonly optional onPointerOutCapture?: (e) => void;
```

###### Parameters

###### e

`PointerEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onPointerOutCapture
```

##### onPointerOver?

```ts
readonly optional onPointerOver?: (e) => void;
```

###### Parameters

###### e

`PointerEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onPointerOver
```

##### onPointerOverCapture?

```ts
readonly optional onPointerOverCapture?: (e) => void;
```

###### Parameters

###### e

`PointerEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onPointerOverCapture
```

##### onPointerUp?

```ts
readonly optional onPointerUp?: (e) => void;
```

###### Parameters

###### e

`PointerEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onPointerUp
```

##### onPointerUpCapture?

```ts
readonly optional onPointerUpCapture?: (e) => void;
```

###### Parameters

###### e

`PointerEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onPointerUpCapture
```

##### onResponderEnd?

```ts
readonly optional onResponderEnd?: (e) => void;
```

###### Parameters

###### e

`GestureResponderEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onResponderEnd
```

##### onResponderGrant?

```ts
readonly optional onResponderGrant?: (e) => boolean | void;
```

The View is now responding for touch events. This is the time to highlight
and show the user what is happening.

`View.props.onResponderGrant: (event) => {}`, where `event` is a synthetic
touch event as described above.

Return true from this callback to prevent any other native components from
becoming responder until this responder terminates (Android-only).

See https://reactnative.dev/docs/view#onrespondergrant

###### Parameters

###### e

`GestureResponderEvent`

###### Returns

`boolean` \| `void`

###### Inherited from

```ts
ViewProps.onResponderGrant
```

##### onResponderMove?

```ts
readonly optional onResponderMove?: (e) => void;
```

The user is moving their finger.

`View.props.onResponderMove: (event) => {}`, where `event` is a synthetic
touch event as described above.

See https://reactnative.dev/docs/view#onrespondermove

###### Parameters

###### e

`GestureResponderEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onResponderMove
```

##### onResponderReject?

```ts
readonly optional onResponderReject?: (e) => void;
```

Another responder is already active and will not release it to that `View`
asking to be the responder.

`View.props.onResponderReject: (event) => {}`, where `event` is a
synthetic touch event as described above.

See https://reactnative.dev/docs/view#onresponderreject

###### Parameters

###### e

`GestureResponderEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onResponderReject
```

##### onResponderRelease?

```ts
readonly optional onResponderRelease?: (e) => void;
```

Fired at the end of the touch.

`View.props.onResponderRelease: (event) => {}`, where `event` is a
synthetic touch event as described above.

See https://reactnative.dev/docs/view#onresponderrelease

###### Parameters

###### e

`GestureResponderEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onResponderRelease
```

##### onResponderStart?

```ts
readonly optional onResponderStart?: (e) => void;
```

###### Parameters

###### e

`GestureResponderEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onResponderStart
```

##### onResponderTerminate?

```ts
readonly optional onResponderTerminate?: (e) => void;
```

The responder has been taken from the `View`. Might be taken by other
views after a call to `onResponderTerminationRequest`, or might be taken
by the OS without asking (e.g., happens with control center/ notification
center on iOS)

`View.props.onResponderTerminate: (event) => {}`, where `event` is a
synthetic touch event as described above.

See https://reactnative.dev/docs/view#onresponderterminate

###### Parameters

###### e

`GestureResponderEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onResponderTerminate
```

##### onResponderTerminationRequest?

```ts
readonly optional onResponderTerminationRequest?: (e) => boolean;
```

Some other `View` wants to become responder and is asking this `View` to
release its responder. Returning `true` allows its release.

`View.props.onResponderTerminationRequest: (event) => {}`, where `event`
is a synthetic touch event as described above.

See https://reactnative.dev/docs/view#onresponderterminationrequest

###### Parameters

###### e

`GestureResponderEvent`

###### Returns

`boolean`

###### Inherited from

```ts
ViewProps.onResponderTerminationRequest
```

##### onStartShouldSetResponder?

```ts
readonly optional onStartShouldSetResponder?: (e) => boolean;
```

Does this view want to become responder on the start of a touch?

`View.props.onStartShouldSetResponder: (event) => [true | false]`, where
`event` is a synthetic touch event as described above.

See https://reactnative.dev/docs/view#onstartshouldsetresponder

###### Parameters

###### e

`GestureResponderEvent`

###### Returns

`boolean`

###### Inherited from

```ts
ViewProps.onStartShouldSetResponder
```

##### onStartShouldSetResponderCapture?

```ts
readonly optional onStartShouldSetResponderCapture?: (e) => boolean;
```

If a parent `View` wants to prevent a child `View` from becoming responder
on a touch start, it should have this handler which returns `true`.

`View.props.onStartShouldSetResponderCapture: (event) => [true | false]`,
where `event` is a synthetic touch event as described above.

See https://reactnative.dev/docs/view#onstartshouldsetrespondercapture

###### Parameters

###### e

`GestureResponderEvent`

###### Returns

`boolean`

###### Inherited from

```ts
ViewProps.onStartShouldSetResponderCapture
```

##### onTouchCancel?

```ts
readonly optional onTouchCancel?: (e) => void;
```

###### Parameters

###### e

`GestureResponderEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onTouchCancel
```

##### onTouchCancelCapture?

```ts
readonly optional onTouchCancelCapture?: (e) => void;
```

###### Parameters

###### e

`GestureResponderEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onTouchCancelCapture
```

##### onTouchEnd?

```ts
readonly optional onTouchEnd?: (e) => void;
```

###### Parameters

###### e

`GestureResponderEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onTouchEnd
```

##### onTouchEndCapture?

```ts
readonly optional onTouchEndCapture?: (e) => void;
```

###### Parameters

###### e

`GestureResponderEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onTouchEndCapture
```

##### onTouchMove?

```ts
readonly optional onTouchMove?: (e) => void;
```

###### Parameters

###### e

`GestureResponderEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onTouchMove
```

##### onTouchMoveCapture?

```ts
readonly optional onTouchMoveCapture?: (e) => void;
```

###### Parameters

###### e

`GestureResponderEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onTouchMoveCapture
```

##### onTouchStart?

```ts
readonly optional onTouchStart?: (e) => void;
```

###### Parameters

###### e

`GestureResponderEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onTouchStart
```

##### onTouchStartCapture?

```ts
readonly optional onTouchStartCapture?: (e) => void;
```

###### Parameters

###### e

`GestureResponderEvent`

###### Returns

`void`

###### Inherited from

```ts
ViewProps.onTouchStartCapture
```

##### participantId

```ts
participantId: string;
```

Participant whose video stream should be rendered.

##### pointerEvents?

```ts
readonly optional pointerEvents?: "none" | "auto" | "box-none" | "box-only";
```

Controls whether the `View` can be the target of touch events.

See https://reactnative.dev/docs/view#pointerevents

###### Inherited from

```ts
ViewProps.pointerEvents
```

##### removeClippedSubviews?

```ts
readonly optional removeClippedSubviews?: boolean;
```

This is a special performance property exposed by `RCTView` and is useful
for scrolling content when there are many subviews, most of which are
offscreen. For this property to be effective, it must be applied to a
view that contains many subviews that extend outside its bound. The
subviews must also have `overflow: hidden`, as should the containing view
(or one of its superviews).

See https://reactnative.dev/docs/view#removeclippedsubviews

###### Inherited from

```ts
ViewProps.removeClippedSubviews
```

##### renderToHardwareTextureAndroid?

```ts
readonly optional renderToHardwareTextureAndroid?: boolean;
```

Whether this `View` should render itself (and all of its children) into a
single hardware texture on the GPU.

###### Platform

android

See https://reactnative.dev/docs/view#rendertohardwaretextureandroid

###### Inherited from

```ts
ViewProps.renderToHardwareTextureAndroid
```

##### role?

```ts
readonly optional role?: Role;
```

Alias for accessibilityRole

###### Inherited from

```ts
ViewProps.role
```

##### screenReaderFocusable?

```ts
readonly optional screenReaderFocusable?: boolean;
```

Enables the view to be screen reader focusable, not keyboard focusable. This has lower priority
than focusable or accessible props.

###### Platform

android

###### Inherited from

```ts
ViewProps.screenReaderFocusable
```

##### shouldRasterizeIOS?

```ts
readonly optional shouldRasterizeIOS?: boolean;
```

Whether this `View` should be rendered as a bitmap before compositing.

###### Platform

ios

See https://reactnative.dev/docs/view#shouldrasterizeios

###### Inherited from

```ts
ViewProps.shouldRasterizeIOS
```

##### style?

```ts
readonly optional style?: ____ViewStyleProp_Internal;
```

###### Inherited from

```ts
ViewProps.style
```

##### tabIndex?

```ts
readonly optional tabIndex?: 0 | -1;
```

Indicates whether this `View` should be focusable with a non-touch input device, eg. receive focus with a hardware keyboard.
See https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex
for more details.

Supports the following values:
-  0 (View is focusable)
- -1 (View is not focusable)

###### Platform

android

###### Inherited from

```ts
ViewProps.tabIndex
```

##### testID?

```ts
readonly optional testID?: string;
```

Used to locate this view in end-to-end tests.

> This disables the 'layout-only view removal' optimization for this view!

See https://reactnative.dev/docs/view#testid

###### Inherited from

```ts
ViewProps.testID
```

***

### IVSStageOptions

***

### IVSStageState

#### Properties

##### audioOutput

```ts
audioOutput: AudioOutput;
```

##### cameraEnabled

```ts
cameraEnabled: boolean;
```

##### cameraPosition

```ts
cameraPosition: CameraPosition;
```

##### connectionState

```ts
connectionState: StageConnectionState;
```

##### microphoneEnabled

```ts
microphoneEnabled: boolean;
```

##### publishEnabled

```ts
publishEnabled: boolean;
```

##### publishState

```ts
publishState: ParticipantPublishState;
```

***

### IVSStageStreamInfo

#### Properties

##### deviceType

```ts
deviceType: DeviceType;
```

##### isMuted

```ts
isMuted: boolean;
```

##### mediaType

```ts
mediaType: MediaType;
```

##### urn

```ts
urn: string;
```

***

### IVSVideoConfig

#### Properties

##### height?

```ts
optional height?: number;
```

##### maxBitrate?

```ts
optional maxBitrate?: number;
```

##### minBitrate?

```ts
optional minBitrate?: number;
```

##### targetFramerate?

```ts
optional targetFramerate?: number;
```

##### width?

```ts
optional width?: number;
```

***

### JoinOptions

#### Properties

##### publish?

```ts
optional publish?: boolean;
```

When true, acquire devices and publish immediately after join. Default false.

***

### NativeErrorDetails

#### Properties

##### code?

```ts
optional code?: number;
```

##### domain?

```ts
optional domain?: string;
```

##### message?

```ts
optional message?: string;
```

##### userInfo?

```ts
optional userInfo?: Record<string, string | number>;
```

## Type Aliases

### AspectMode

```ts
type AspectMode = "fill" | "fit";
```

***

### AudioOutput

```ts
type AudioOutput = "auto" | "speaker" | "earpiece" | "bluetooth" | "wired";
```

***

### AudioPreset

```ts
type AudioPreset = "video-chat" | "subscribe-only" | "studio";
```

***

### CameraPosition

```ts
type CameraPosition = "front" | "back";
```

***

### DevicePosition

```ts
type DevicePosition = "front" | "back" | "usb" | "bluetooth" | "aux" | "unknown";
```

***

### DeviceType

```ts
type DeviceType = "camera" | "microphone" | "userImage" | "userAudio" | "unknown";
```

***

### IVSErrorCode

```ts
type IVSErrorCode = 
  | "token-expired"
  | "token-invalid"
  | "join-failed"
  | "permission-denied"
  | "device-unavailable"
  | "disconnected"
  | "stage-in-use"
  | "disposed"
  | "not-linked"
  | "unknown";
```

***

### IVSStageProviderProps

```ts
type IVSStageProviderProps = object;
```

#### Properties

##### children

```ts
children: ReactNode;
```

##### joinOptions?

```ts
optional joinOptions?: JoinOptions;
```

Join options used when `token` prop triggers auto-join.

##### subscribe?

```ts
optional subscribe?: SubscribeType;
```

Default subscribe type for remote participants. Defaults to audio-video.

##### token?

```ts
optional token?: string;
```

When set, automatically joins on mount / token change.

##### videoConfig?

```ts
optional videoConfig?: IVSVideoConfig;
```

Video quality settings applied when publishing.

***

### Listener

```ts
type Listener<E> = (event) => void;
```

#### Type Parameters

##### E

`E` *extends* [`StageEventName`](#stageeventname)

#### Parameters

##### event

[`StageEventMap`](#stageeventmap)\[`E`\]

#### Returns

`void`

***

### MediaType

```ts
type MediaType = "audio" | "video";
```

***

### ParticipantPublishState

```ts
type ParticipantPublishState = "notPublished" | "attemptingPublish" | "published";
```

***

### ParticipantSubscribeState

```ts
type ParticipantSubscribeState = "notSubscribed" | "attemptingSubscribe" | "subscribed";
```

***

### PermissionStatus

```ts
type PermissionStatus = "granted" | "denied" | "restricted" | "undetermined";
```

***

### StageConnectionState

```ts
type StageConnectionState = "disconnected" | "connecting" | "connected";
```

***

### StageContextValue

```ts
type StageContextValue = object;
```

#### Properties

##### audioRoute

```ts
audioRoute: IVSAudioRoute;
```

##### cameraEnabled

```ts
cameraEnabled: boolean;
```

##### cameraPosition

```ts
cameraPosition: CameraPosition;
```

##### clearError

```ts
clearError: () => void;
```

###### Returns

`void`

##### connectionState

```ts
connectionState: StageConnectionState;
```

##### error

```ts
error: IVSError | null;
```

##### flipCamera

```ts
flipCamera: () => Promise<void>;
```

###### Returns

`Promise`\<`void`\>

##### join

```ts
join: (token, opts?) => Promise<void>;
```

###### Parameters

###### token

`string`

###### opts?

[`JoinOptions`](#joinoptions)

###### Returns

`Promise`\<`void`\>

##### leave

```ts
leave: () => Promise<void>;
```

###### Returns

`Promise`\<`void`\>

##### localParticipant

```ts
localParticipant: IVSParticipantInfo | null;
```

##### microphoneEnabled

```ts
microphoneEnabled: boolean;
```

##### participants

```ts
participants: IVSParticipantInfo[];
```

##### prepareDevices

```ts
prepareDevices: (opts?) => Promise<void>;
```

###### Parameters

###### opts?

###### camera?

`boolean`

###### microphone?

`boolean`

###### Returns

`Promise`\<`void`\>

##### publishEnabled

```ts
publishEnabled: boolean;
```

##### publishState

```ts
publishState: ParticipantPublishState;
```

##### releaseDevices

```ts
releaseDevices: () => Promise<void>;
```

###### Returns

`Promise`\<`void`\>

##### renewToken

```ts
renewToken: (token) => Promise<void>;
```

###### Parameters

###### token

`string`

###### Returns

`Promise`\<`void`\>

##### requestPermissions

```ts
requestPermissions: () => Promise<{
  camera: PermissionStatus;
  microphone: PermissionStatus;
}>;
```

###### Returns

`Promise`\<\{
  `camera`: [`PermissionStatus`](#permissionstatus);
  `microphone`: [`PermissionStatus`](#permissionstatus);
\}\>

##### setAudioOutput

```ts
setAudioOutput: (output) => Promise<void>;
```

###### Parameters

###### output

[`AudioOutput`](#audiooutput-1)

###### Returns

`Promise`\<`void`\>

##### setCameraEnabled

```ts
setCameraEnabled: (enabled) => Promise<void>;
```

###### Parameters

###### enabled

`boolean`

###### Returns

`Promise`\<`void`\>

##### setCameraPosition

```ts
setCameraPosition: (position) => Promise<void>;
```

###### Parameters

###### position

[`CameraPosition`](#cameraposition-1)

###### Returns

`Promise`\<`void`\>

##### setMicrophoneEnabled

```ts
setMicrophoneEnabled: (enabled) => Promise<void>;
```

###### Parameters

###### enabled

`boolean`

###### Returns

`Promise`\<`void`\>

##### ~~setMicrophoneMuted~~

```ts
setMicrophoneMuted: (muted) => Promise<void>;
```

###### Parameters

###### muted

`boolean`

###### Returns

`Promise`\<`void`\>

###### Deprecated

Use setMicrophoneEnabled(!muted)

##### setPublishEnabled

```ts
setPublishEnabled: (enabled) => Promise<void>;
```

###### Parameters

###### enabled

`boolean`

###### Returns

`Promise`\<`void`\>

##### ~~setPublishing~~

```ts
setPublishing: (enabled) => Promise<void>;
```

###### Parameters

###### enabled

`boolean`

###### Returns

`Promise`\<`void`\>

###### Deprecated

Use setPublishEnabled

##### setSubscribeType

```ts
setSubscribeType: (participantId, type) => Promise<void>;
```

###### Parameters

###### participantId

`string`

###### type

[`SubscribeType`](#subscribetype)

###### Returns

`Promise`\<`void`\>

##### stage

```ts
stage: IVSStage;
```

##### ~~switchCamera~~

```ts
switchCamera: (position?) => Promise<void>;
```

###### Parameters

###### position?

[`CameraPosition`](#cameraposition-1)

###### Returns

`Promise`\<`void`\>

###### Deprecated

Use flipCamera / setCameraPosition

***

### StageEventMap

```ts
type StageEventMap = object;
```

#### Properties

##### audioRouteChanged

```ts
audioRouteChanged: IVSAudioRoute;
```

##### connectionStateChanged

```ts
connectionStateChanged: object;
```

###### error?

```ts
optional error?: IVSError;
```

###### state

```ts
state: StageConnectionState;
```

##### error

```ts
error: IVSError;
```

##### participantJoined

```ts
participantJoined: IVSParticipantInfo;
```

##### participantLeft

```ts
participantLeft: object;
```

###### participantId

```ts
participantId: string;
```

##### participantUpdated

```ts
participantUpdated: IVSParticipantInfo;
```

##### streamsChanged

```ts
streamsChanged: object;
```

###### participantId

```ts
participantId: string;
```

###### streams

```ts
streams: IVSStageStreamInfo[];
```

***

### StageEventName

```ts
type StageEventName = keyof StageEventMap;
```

***

### SubscribeType

```ts
type SubscribeType = "none" | "audio-only" | "audio-video";
```

## Functions

### enumerateDevices()

```ts
function enumerateDevices(): Promise<IVSDeviceInfo[]>;
```

#### Returns

`Promise`\<[`IVSDeviceInfo`](#ivsdeviceinfo)[]\>

***

### getCameraPermission()

```ts
function getCameraPermission(): Promise<PermissionStatus>;
```

#### Returns

`Promise`\<[`PermissionStatus`](#permissionstatus)\>

***

### getCapabilities()

```ts
function getCapabilities(): Promise<IVSCapabilities>;
```

#### Returns

`Promise`\<[`IVSCapabilities`](#ivscapabilities)\>

***

### getMicrophonePermission()

```ts
function getMicrophonePermission(): Promise<PermissionStatus>;
```

#### Returns

`Promise`\<[`PermissionStatus`](#permissionstatus)\>

***

### getSdkVersion()

```ts
function getSdkVersion(): Promise<string>;
```

Version of the underlying native Amazon IVS Broadcast SDK.

#### Returns

`Promise`\<`string`\>

***

### IVSLocalPreviewView()

```ts
function IVSLocalPreviewView(__namedParameters): Element;
```

Live local device preview (green room / permission screens / pre-join).
Camera position is controlled via `IVSStage.flipCamera()` / `setCameraPosition()` —
not via a prop — so flips are not silently reverted by React prop updates.

#### Parameters

##### \_\_namedParameters

[`IVSLocalPreviewViewProps`](#ivslocalpreviewviewprops)

#### Returns

`Element`

***

### IVSParticipantVideoView()

```ts
function IVSParticipantVideoView(__namedParameters): Element;
```

Renders a remote (or local) participant's video stage stream natively.

#### Parameters

##### \_\_namedParameters

[`IVSParticipantVideoViewProps`](#ivsparticipantvideoviewprops)

#### Returns

`Element`

***

### IVSStageProvider()

```ts
function IVSStageProvider(__namedParameters): Element;
```

Owns an IVSStage instance and reconciles participant/connection state.
Subscribes to events first, then snapshots via listParticipants() —
the reverse order drops anything emitted between snapshot and subscription.

#### Parameters

##### \_\_namedParameters

[`IVSStageProviderProps`](#ivsstageproviderprops)

#### Returns

`Element`

***

### requestCameraPermission()

```ts
function requestCameraPermission(): Promise<PermissionStatus>;
```

#### Returns

`Promise`\<[`PermissionStatus`](#permissionstatus)\>

***

### requestMicrophonePermission()

```ts
function requestMicrophonePermission(): Promise<PermissionStatus>;
```

#### Returns

`Promise`\<[`PermissionStatus`](#permissionstatus)\>

***

### useAudioRoute()

```ts
function useAudioRoute(): Pick<StageContextValue, "audioRoute" | "setAudioOutput">;
```

Current audio route plus setter, fed by `audioRouteChanged`.

#### Returns

`Pick`\<[`StageContextValue`](#stagecontextvalue), `"audioRoute"` \| `"setAudioOutput"`\>

***

### useLocalMedia()

```ts
function useLocalMedia(): Pick<StageContextValue, 
  | "localParticipant"
  | "publishEnabled"
  | "publishState"
  | "microphoneEnabled"
  | "cameraEnabled"
  | "cameraPosition"
  | "setPublishEnabled"
  | "setMicrophoneEnabled"
  | "setCameraEnabled"
  | "setCameraPosition"
  | "flipCamera"
  | "prepareDevices"
  | "releaseDevices"
  | "requestPermissions"
  | "setPublishing"
  | "setMicrophoneMuted"
| "switchCamera">;
```

Local media controls and publish intent/state.

#### Returns

`Pick`\<[`StageContextValue`](#stagecontextvalue), 
  \| `"localParticipant"`
  \| `"publishEnabled"`
  \| `"publishState"`
  \| `"microphoneEnabled"`
  \| `"cameraEnabled"`
  \| `"cameraPosition"`
  \| `"setPublishEnabled"`
  \| `"setMicrophoneEnabled"`
  \| `"setCameraEnabled"`
  \| `"setCameraPosition"`
  \| `"flipCamera"`
  \| `"prepareDevices"`
  \| `"releaseDevices"`
  \| `"requestPermissions"`
  \| `"setPublishing"`
  \| `"setMicrophoneMuted"`
  \| `"switchCamera"`\>

***

### useParticipants()

```ts
function useParticipants(): IVSParticipantInfo[];
```

All participants currently on the stage (local + remote).

#### Returns

[`IVSParticipantInfo`](#ivsparticipantinfo)[]

***

### useParticipantStreams()

```ts
function useParticipantStreams(participantId): IVSStageStreamInfo[];
```

Thin selector over useParticipants — streams render natively by participantId;
JS only sees metadata.

#### Parameters

##### participantId

`string`

#### Returns

[`IVSStageStreamInfo`](#ivsstagestreaminfo)[]

***

### useStage()

```ts
function useStage(): Pick<StageContextValue, 
  | "connectionState"
  | "error"
  | "join"
  | "leave"
  | "renewToken"
  | "clearError"
| "stage">;
```

Connection state, join/leave, and the underlying IVSStage instance.

#### Returns

`Pick`\<[`StageContextValue`](#stagecontextvalue), 
  \| `"connectionState"`
  \| `"error"`
  \| `"join"`
  \| `"leave"`
  \| `"renewToken"`
  \| `"clearError"`
  \| `"stage"`\>

***

### useStageContext()

```ts
function useStageContext(): StageContextValue;
```

#### Returns

[`StageContextValue`](#stagecontextvalue)

***

### useStageEvent()

```ts
function useStageEvent<E>(event, listener): void;
```

Subscribe to a Stage event for side effects (analytics, toasts).
Generic over the event name so the listener payload is typed from StageEventMap.

#### Type Parameters

##### E

`E` *extends* keyof [`StageEventMap`](#stageeventmap)

#### Parameters

##### event

`E`

##### listener

(`payload`) => `void`

#### Returns

`void`
