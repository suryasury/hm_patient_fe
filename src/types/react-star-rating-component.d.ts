declare module "react-rating-stars-component" {
  import { Component } from "react";

  interface ReactStarsProps {
    count?: number;
    value?: number;
    onChange?: (newRating: number) => void;
    size?: number;
    isHalf?: boolean;
    edit?: boolean;
    activeColor?: string;
    color?: string;
    a11y?: boolean;
    classNames?: string;
    disabled?: boolean;
  }

  class ReactStars extends Component<ReactStarsProps> {}

  export default ReactStars;
}
