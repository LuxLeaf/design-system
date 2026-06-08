import{B as F}from"./Button-DPK0WquK.js";import"./jsx-runtime-Ltbql5mm.js";import"./iframe-CWUvTVax.js";import"./preload-helper-Dp1pzeXC.js";const{fn:$}=__STORYBOOK_MODULE_TEST__,P={title:"Example/Button",component:F,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{backgroundColor:{control:"color"}},args:{onClick:$()}},r={args:{primary:!0,label:"Button"}},a={args:{label:"Button"}},e={args:{label:"OAuth Button"}},t={name:"Secondary OAuth Button",args:{label:"OAuth Button"}},s={args:{size:"large",label:"Button"}},o={args:{size:"small",label:"Small Button"}},n={args:{label:"Flaky Button"},render:M=>{const c=Math.random();return F({...M,style:{transform:`translate(${c}px, ${c}px)`}})}};var l,u,m;r.parameters={...r.parameters,docs:{...(l=r.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {
    primary: true,
    label: 'Button'
  }
}`,...(m=(u=r.parameters)==null?void 0:u.docs)==null?void 0:m.source}}};var p,i,d;a.parameters={...a.parameters,docs:{...(p=a.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    label: 'Button'
  }
}`,...(d=(i=a.parameters)==null?void 0:i.docs)==null?void 0:d.source}}};var g,B,y;e.parameters={...e.parameters,docs:{...(g=e.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    label: 'OAuth Button'
  }
}`,...(y=(B=e.parameters)==null?void 0:B.docs)==null?void 0:y.source}}};var S,b,h;t.parameters={...t.parameters,docs:{...(S=t.parameters)==null?void 0:S.docs,source:{originalSource:`{
  name: 'Secondary OAuth Button',
  args: {
    label: 'OAuth Button'
  }
}`,...(h=(b=t.parameters)==null?void 0:b.docs)==null?void 0:h.source}}};var O,f,A;s.parameters={...s.parameters,docs:{...(O=s.parameters)==null?void 0:O.docs,source:{originalSource:`{
  args: {
    size: 'large',
    label: 'Button'
  }
}`,...(A=(f=s.parameters)==null?void 0:f.docs)==null?void 0:A.source}}};var x,_,k;o.parameters={...o.parameters,docs:{...(x=o.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    size: 'small',
    label: 'Small Button'
  }
}`,...(k=(_=o.parameters)==null?void 0:_.docs)==null?void 0:k.source}}};var T,z,E;n.parameters={...n.parameters,docs:{...(T=n.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {
    label: 'Flaky Button'
  },
  render: args => {
    // Sub-pixel translate makes anti-aliasing differ between captures,
    // which triggers the capture engine's retry path. Text, colors, and
    // layout stay identical, so accessibility rules see a stable DOM.
    const offset = Math.random();
    return Button({
      ...args,
      style: {
        transform: \`translate(\${offset}px, \${offset}px)\`
      }
    });
  }
}`,...(E=(z=n.parameters)==null?void 0:z.docs)==null?void 0:E.source}}};const K=["Primary","Secondary","OAuthButton","SecondaryOAuthButton","Large","Small","Flaky"];export{n as Flaky,s as Large,e as OAuthButton,r as Primary,a as Secondary,t as SecondaryOAuthButton,o as Small,K as __namedExportsOrder,P as default};
