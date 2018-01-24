"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const core_1 = require('@angular/core');
let DragScroll = class DragScroll {
    constructor(el, renderer) {
        this.el = el;
        this.renderer = renderer;
        this.isPressed = false;
        this.downX = 0;
        this.downY = 0;
        this.onMouseMoveHandler = this.onMouseMove.bind(this);
        this.onMouseUpHandler = this.onMouseUp.bind(this);
        this.scrollbarWidth = `${this.getScrollbarWidth()}px`;
        el.nativeElement.style.overflow = 'auto';
        el.nativeElement.style.whiteSpace = 'noWrap';
        document.addEventListener('mousemove', this.onMouseMoveHandler, false);
        document.addEventListener('mouseup', this.onMouseUpHandler, false);
    }
    get scrollbarHidden() { return this._scrollbarHidden; }
    set scrollbarHidden(value) { this._scrollbarHidden = value; }
    ;
    get disabled() { return this._disabled; }
    set disabled(value) { this._disabled = value; }
    ;
    get xDisabled() { return this._xDisabled; }
    set xDisabled(value) { this._xDisabled = value; }
    ;
    get yDisabled() { return this._yDisabled; }
    set yDisabled(value) { this._yDisabled = value; }
    ;
    onMouseDown(e) {
        e.preventDefault();
        this.isPressed = true;
        this.downX = e.clientX;
        this.downY = e.clientY;
        return false;
    }
    ngOnChanges() {
        if (this.scrollbarHidden) {
            this.hideScrollbar();
        }
        else {
            this.showScrollbar();
        }
        if (this.xDisabled || this.disabled) {
            this.disableScroll('x');
        }
        else {
            this.enableScroll('x');
        }
        if (this.yDisabled || this.disabled) {
            this.disableScroll('y');
        }
        else {
            this.enableScroll('y');
        }
    }
    ngOnInit() {
        this.rect = this.el.nativeElement.getBoundingClientRect();
        this.renderer.setElementAttribute(this.el.nativeElement, 'drag-scroll', 'true');
    }
    ngAfterViewChecked() {
        if (this.wrapper) {
            this.checkScrollbar();
        }
    }
    ngOnDestroy() {
        this.renderer.setElementAttribute(this.el.nativeElement, 'drag-scroll', 'false');
        document.removeEventListener('mousemove', this.onMouseMoveHandler, false);
        document.removeEventListener('mouseup', this.onMouseUpHandler, false);
    }
    onMouseMove(e) {
        if (this.isPressed && !this.disabled) {
            e.preventDefault();
            if (!this.xDisabled) {
                this.el.nativeElement.scrollLeft =
                    this.el.nativeElement.scrollLeft - e.clientX + this.downX;
                this.downX = e.clientX;
            }
            if (!this.yDisabled) {
                this.el.nativeElement.scrollTop =
                    this.el.nativeElement.scrollTop - e.clientY + this.downY;
                this.downY = e.clientY;
            }
        }
        return false;
    }
    onMouseUp(e) {
        e.preventDefault();
        this.isPressed = false;
        return false;
    }
    disableScroll(axis) {
        this.el.nativeElement.style[`overflow-${axis}`] = 'hidden';
    }
    enableScroll(axis) {
        this.el.nativeElement.style[`overflow-${axis}`] = 'auto';
    }
    hideScrollbar() {
        this.parentNode = this.el.nativeElement.parentNode;
        this.wrapper = document.createElement('div');
        this.wrapper.style.width = this.el.nativeElement.offsetWidth + 'px';
        this.wrapper.style.height = this.el.nativeElement.offsetHeight + 'px';
        this.wrapper.style.overflow = 'hidden';
        this.el.nativeElement.style.width = `calc(100% + ${this.scrollbarWidth})`;
        this.el.nativeElement.style.height = `calc(100% + ${this.scrollbarWidth})`;
        this.parentNode.replaceChild(this.wrapper, this.el.nativeElement);
        this.wrapper.appendChild(this.el.nativeElement);
    }
    showScrollbar() {
        if (this.wrapper) {
            this.el.nativeElement.style.width = this.wrapper.style.width;
            this.el.nativeElement.style.height = this.wrapper.style.height;
            this.parentNode.removeChild(this.wrapper);
            this.parentNode.appendChild(this.el.nativeElement);
            this.wrapper = null;
        }
    }
    checkScrollbar() {
        if (this.el.nativeElement.scrollWidth <= this.el.nativeElement.clientWidth) {
            this.el.nativeElement.style.height = '100%';
        }
        else {
            this.el.nativeElement.style.height = `calc(100% + ${this.scrollbarWidth})`;
        }
        if (this.el.nativeElement.scrollHeight <= this.el.nativeElement.clientHeight) {
            this.el.nativeElement.style.width = '100%';
        }
        else {
            this.el.nativeElement.style.width = `calc(100% + ${this.scrollbarWidth})`;
        }
    }
    getScrollbarWidth() {
        const outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.width = '100px';
        outer.style.msOverflowStyle = 'scrollbar';
        document.body.appendChild(outer);
        const widthNoScroll = outer.offsetWidth;
        outer.style.overflow = 'scroll';
        const inner = document.createElement('div');
        inner.style.width = '100%';
        outer.appendChild(inner);
        const widthWithScroll = inner.offsetWidth;
        outer.parentNode.removeChild(outer);
        return widthNoScroll - widthWithScroll || 20;
    }
};
__decorate([
    core_1.Input('scrollbar-hidden'), 
    __metadata('design:type', Object)
], DragScroll.prototype, "scrollbarHidden", null);
__decorate([
    core_1.Input('drag-scroll-disabled'), 
    __metadata('design:type', Object)
], DragScroll.prototype, "disabled", null);
__decorate([
    core_1.Input('drag-scroll-x-disabled'), 
    __metadata('design:type', Object)
], DragScroll.prototype, "xDisabled", null);
__decorate([
    core_1.Input('drag-scroll-y-disabled'), 
    __metadata('design:type', Object)
], DragScroll.prototype, "yDisabled", null);
__decorate([
    core_1.HostListener('mousedown', ['$event']), 
    __metadata('design:type', Function), 
    __metadata('design:paramtypes', [MouseEvent]), 
    __metadata('design:returntype', void 0)
], DragScroll.prototype, "onMouseDown", null);
DragScroll = __decorate([
    core_1.Directive({
        selector: '[drag-scroll]'
    }), 
    __metadata('design:paramtypes', [core_1.ElementRef, core_1.Renderer])
], DragScroll);
exports.DragScroll = DragScroll;
let DragScrollModule = class DragScrollModule {
};
DragScrollModule = __decorate([
    core_1.NgModule({
        exports: [DragScroll],
        declarations: [DragScroll]
    }), 
    __metadata('design:paramtypes', [])
], DragScrollModule);
exports.DragScrollModule = DragScrollModule;
