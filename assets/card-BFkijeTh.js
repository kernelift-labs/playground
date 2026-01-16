import{a as e}from"./button-D0DtWiwF.js";import{D as t,I as n,O as r,T as i,U as a,V as o,h as s}from"./index-_Y7sQ1u4.js";var c={name:`Card`,extends:{name:`BaseCard`,extends:e,style:s.extend({name:`card`,style:`
    .p-card {
        background: dt('card.background');
        color: dt('card.color');
        box-shadow: dt('card.shadow');
        border-radius: dt('card.border.radius');
        display: flex;
        flex-direction: column;
    }

    .p-card-caption {
        display: flex;
        flex-direction: column;
        gap: dt('card.caption.gap');
    }

    .p-card-body {
        padding: dt('card.body.padding');
        display: flex;
        flex-direction: column;
        gap: dt('card.body.gap');
    }

    .p-card-title {
        font-size: dt('card.title.font.size');
        font-weight: dt('card.title.font.weight');
    }

    .p-card-subtitle {
        color: dt('card.subtitle.color');
    }
`,classes:{root:`p-card p-component`,header:`p-card-header`,body:`p-card-body`,caption:`p-card-caption`,title:`p-card-title`,subtitle:`p-card-subtitle`,content:`p-card-content`,footer:`p-card-footer`}}),provide:function(){return{$pcCard:this,$parentInstance:this}}},inheritAttrs:!1};function l(e,s,c,l,u,d){return o(),r(`div`,n({class:e.cx(`root`)},e.ptmi(`root`)),[e.$slots.header?(o(),r(`div`,n({key:0,class:e.cx(`header`)},e.ptm(`header`)),[a(e.$slots,`header`)],16)):t(``,!0),i(`div`,n({class:e.cx(`body`)},e.ptm(`body`)),[e.$slots.title||e.$slots.subtitle?(o(),r(`div`,n({key:0,class:e.cx(`caption`)},e.ptm(`caption`)),[e.$slots.title?(o(),r(`div`,n({key:0,class:e.cx(`title`)},e.ptm(`title`)),[a(e.$slots,`title`)],16)):t(``,!0),e.$slots.subtitle?(o(),r(`div`,n({key:1,class:e.cx(`subtitle`)},e.ptm(`subtitle`)),[a(e.$slots,`subtitle`)],16)):t(``,!0)],16)):t(``,!0),i(`div`,n({class:e.cx(`content`)},e.ptm(`content`)),[a(e.$slots,`content`)],16),e.$slots.footer?(o(),r(`div`,n({key:1,class:e.cx(`footer`)},e.ptm(`footer`)),[a(e.$slots,`footer`)],16)):t(``,!0)],16)],16)}c.render=l;export{c as t};