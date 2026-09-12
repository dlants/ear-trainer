type DismissLayer = {
  el: HTMLElement;
  onClose: () => void;
};

export class DismissStack {
  private layers: DismissLayer[] = [];
  private attached = false;

  private readonly onPointerDown = (event: PointerEvent): void => {
    const top = this.layers[this.layers.length - 1];
    if (!top) return;
    if (event.target instanceof Node && top.el.contains(event.target)) return;
    top.onClose();
  };

  private readonly onKeydown = (event: KeyboardEvent): void => {
    if (event.key !== "Escape") return;
    this.layers[this.layers.length - 1]?.onClose();
  };

  attach(el: HTMLElement, onClose: () => void): () => void {
    const layer = { el, onClose };
    this.layers.push(layer);
    if (!this.attached) {
      document.addEventListener("pointerdown", this.onPointerDown);
      document.addEventListener("keydown", this.onKeydown);
      this.attached = true;
    }
    return () => {
      const index = this.layers.indexOf(layer);
      if (index !== -1) this.layers.splice(index, 1);
      if (this.layers.length === 0 && this.attached) {
        document.removeEventListener("pointerdown", this.onPointerDown);
        document.removeEventListener("keydown", this.onKeydown);
        this.attached = false;
      }
    };
  }
}
