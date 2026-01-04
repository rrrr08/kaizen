declare module 'easy-magnify-waft' {
    import * as React from 'react';

    export interface ImageProps {
        alt: string;
        isFluidWidth: boolean;
        src: string;
        width?: number;
        height?: number;
    }

    export interface LargeImageProps {
        src: string;
        width: number;
        height: number;
    }

    export interface ReactImageMagnifyProps {
        smallImage: ImageProps;
        largeImage: LargeImageProps;
        className?: string;
        style?: React.CSSProperties;
        hoverDelayInMs?: number;
        hoverOffDelayInMs?: number;
        fadeDurationInMs?: number;
        pressDuration?: number;
        pressMoveThreshold?: number;
        isHintEnabled?: boolean;
        hintTextMouse?: string;
        hintTextTouch?: string;
        shouldHideHintAfterFirstActivation?: boolean;
        isActivatedOnTouch?: boolean;
        shouldUsePositiveSpaceLens?: boolean;
        lensStyle?: React.CSSProperties;
        enlargedImageContainerClassName?: string;
        enlargedImageContainerStyle?: React.CSSProperties;
        enlargedImageClassName?: string;
        enlargedImageStyle?: React.CSSProperties;
        enlargedImagePosition?: 'beside' | 'over';
        enlargedImageContainerDimensions?: {
            width: number | string;
            height: number | string;
        };
        enlargedImagePortalId?: string;
        cursorStyle?: string;
    }

    const ReactImageMagnify: React.ComponentType<ReactImageMagnifyProps>;
    export default ReactImageMagnify;
}
