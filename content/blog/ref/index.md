---
title: react ref의 모든 것
date: "2023-07-28T22:27:00.000Z"
description: "ref, useRef, useImperativeHandle, flushSync"
---

렌더링을 일으키지 않는다는 특징을 제외하고도, ref를 제대로 활용하려면 해당 지식을 제대로 알고 있어야 할 필요가 있다. 설명이 친절하지 않았던 예전 문서와 달리 새롭게 변경된 리액트 문서에는 굉장히 자세하게 나타나있는데, 실무에서 쓰기 위해 간단하게 번역했던 글을 공유한다. 적어도 ref 사용에서는 아래 내용만 알고 있으면 큰 어려움 없이 사용할 수 있다.

# 기본 개념

[Manipulating the DOM with Refs – React](https://react.dev/learn/manipulating-the-dom-with-refs)

Ref는 부모 컴포넌트에서 자식 컴포넌트를 직접 수정하고 싶을 때 사용한다.

리액트 렌더링 사이클에서 벗어나는 것이므로 `렌더링을 일으키고 싶지 않을 때` 사용한다.

```jsx
const myRef = useRef(null)

// const myRef = {
//   current: null
// };
```

위에 처럼 useRef를 호출하면 current 필드를 가진 객체를 반환한다.

```jsx
<div ref={myRef} />

// const myRef = {
// 	current: <div .../>
// }
```

그리고 위에 처럼 내가 원하는 자식 컴포넌트의 ref 속성에 할당하면, null이 었던 current 필드에 html 태그가 들어간다.

```jsx
const handleClick = () => {
  myRef.current.scrollIntoView();
}

...

<div onClick={handleClick}/>
```

부모 컴포넌트에서는 이 myRef 객체의 current 필드에 접근해서 div 태그의 이벤트 핸들러와 브라우저 내장 API를 사용하여 자식 컴포넌트인 div 태그를 직접 수정한다.

# ref를 여러 개 사용해야 하는 경우

[Manipulating the DOM with Refs – React](https://react.dev/learn/manipulating-the-dom-with-refs#how-to-manage-a-list-of-refs-using-a-ref-callback)

목록에서 각각의 요소마다 ref를 지정해야할 필요가 있을 수 있다.

```jsx
<ul>
  {items.map((item) => {
    // Doesn't work!
    const ref = useRef(null)
    return <li ref={ref} />
  })}
</ul>
```

훅은 언제나 컴포넌트 최상단에서 호출되어야하므로 map 메서드 안이나 특정 조건, 루프 안에서 useRef를 호출할 수 없다.

방법은 두 가지이다.

1. 부모 컴포넌트를 ref에 넣고 querySelectorAll 등으로 자식 컴포넌트를 모두 조회한 뒤 이 중에서 하나를 찾는 방법
   1. DOM 구조가 변경된다면 동작하지 않는다.
2. 자식 컴포넌트의 ref 속성에 함수를 넘긴다.

   ```jsx
   import { useRef } from "react"

   export default function CatFriends() {
     const itemsRef = useRef(null)

     function scrollToId(itemId) {
       const map = getMap()
       const node = map.get(itemId)
       node.scrollIntoView({
         behavior: "smooth",
         block: "nearest",
         inline: "center",
       })
     }

     function getMap() {
       if (!itemsRef.current) {
         // Initialize the Map on first usage.
         itemsRef.current = new Map()
       }
       return itemsRef.current
     }

     return (
       <>
         <nav>
           <button onClick={() => scrollToId(0)}>Tom</button>
           <button onClick={() => scrollToId(5)}>Maru</button>
           <button onClick={() => scrollToId(9)}>Jellylorum</button>
         </nav>
         <div>
           <ul>
             {catList.map((cat) => (
               <li
                 key={cat.id}
                 ref={(node) => {
                   const map = getMap()
                   if (node) {
                     map.set(cat.id, node)
                   } else {
                     map.delete(cat.id)
                   }
                 }}
               >
                 <img src={cat.imageUrl} alt={"Cat #" + cat.id} />
               </li>
             ))}
           </ul>
         </div>
       </>
     )
   }

   const catList = []
   for (let i = 0; i < 10; i++) {
     catList.push({
       id: i,
       imageUrl: "https://placekitten.com/250/200?image=" + i,
     })
   }
   ```

   1. ref 콜백이라고 불린다. 리액트는 ref를 세팅할 때가 되면 DOM 노드에서 ref 콜백 함수를 호출하고 다시 null을 할당해서 초기화한다.
   2. 이 방법은 배열이나 Map을 유지할 수 있게 해줘서 ID등으로 특정 ref에 접근할 수 있다.

# 다른 컴포넌트의 DOM 노드에 접근해야하는 경우

[Manipulating the DOM with Refs – React](https://react.dev/learn/manipulating-the-dom-with-refs#accessing-another-components-dom-nodes)

HTML 태그가 아니라 다른 모듈로 만들어진 다른 컴포넌트의 ref 속성에 생성한 ref 객체를 할당하려고 하면 에러가 난다. 기본적으로 리액트는 컴포넌트가 다른 컴포넌트의 DOM 노드들에 접근하는 것을 허용하지 않는다. 심지어 자식 컴포넌트여도 안 된다. 수동으로 다른 컴포넌트의 DOM 노드를 조작하는 코드는 망가지기 쉽다.

만약 특정 컴포넌트에서 DOM 노드들을 노출하고 싶다면 하위 컴포넌트가 forwardRef를 통해 ref를 받아들일지 말지를 선택해야한다.

App.js

```jsx
import { useRef } from "react"

function MyInput(props) {
  return <input {...props} />
}

export default function MyForm() {
  const inputRef = useRef(null)

  function handleClick() {
    inputRef.current.focus()
  }

  return (
    <>
      <MyInput ref={inputRef} />
      <button onClick={handleClick}>Focus the input</button>
    </>
  )
}
```

MyInput.tsx

```jsx
const MyInput = forwardRef((props, ref) => {
  return <input {...props} ref={ref} />
})
```

1. `<MyInput ref={inputRef} />` 는 리액트에게 inputRef.current에 MyInput DOM 노드를 할당하라고 한다. 기본적으로는 불가능하지만, MyInput 컴포넌트가 어떤 선택을 하고 있느냐에 따라 달라진다.
2. MyInput 컴포넌트는 forwardRef를 사용하여 선언된 상태다. 이것은 props 다음의 두 번째 인자로 넘어오는 ref를 통해 inputRef를 받아들이는 것을 선택했다는 뜻이다.
3. 이제 MyInput에서 forwardRef를 통해 받은 ref를 input에 넘겨줄 수 있다.

```jsx
import { forwardRef, useRef } from "react"

const MyInput = forwardRef((props, ref) => {
  return <input {...props} ref={ref} />
})

export default function Form() {
  const inputRef = useRef(null)

  function handleClick() {
    inputRef.current.focus()
  }

  return (
    <>
      <MyInput ref={inputRef} />
      <button onClick={handleClick}>Focus the input</button>
    </>
  )
}
```

# Imperative handle 을 통해 API의 subset을 노출하는 경우

[Manipulating the DOM with Refs – React](https://react.dev/learn/manipulating-the-dom-with-refs#exposing-a-subset-of-the-api-with-an-imperative-handle)

위의 예제에서 MyInput 컴포넌트는 자식 Input 컴포넌트의 DOM element를 노출한다. 이렇게 함으로써 부모 컴포넌트인 MyInput 컴포넌트에서 자식 Input 컴포넌트에 대한 focus()를 호출할 수 있게 해줬다.

그러나, 부모 컴포넌트에서 자식 컴포넌트의 DOM element가 노출됨에 따라 스타일 변경 등의 기존의 예상하지 않았던 동작을 하게 될 수도 있다. (만약 예전 작업자와 이후 작업자가 다르다면, Input DOM element에 직접 접근할 수 있으므로 예전 작업자가 고려하지 않았던 작업을 이후 작업자가 하게 될 수도 있는 것.) 따라서 이러한 변수를 제거하기 위해 useImperativeHandle을 통해 노출되는 범위를 제한할 수 있다.

```jsx
import { forwardRef, useRef, useImperativeHandle } from "react"

const MyInput = forwardRef((props, ref) => {
  const realInputRef = useRef(null)
  useImperativeHandle(ref, () => ({
    // Only expose focus and nothing else
    focus() {
      realInputRef.current.focus()
    },
  }))
  return <input {...props} ref={realInputRef} />
})

export default function Form() {
  const inputRef = useRef(null)

  function handleClick() {
    inputRef.current.focus()
  }

  return (
    <>
      <MyInput ref={inputRef} />
      <button onClick={handleClick}>Focus the input</button>
    </>
  )
}
```

`return <input {...props} ref={realInputRef} />;`

위 코드에서 MyInput 컴포넌트의 realInputRef는 자식 Input 컴포넌트의 실제 DOM element를 저장하고 있다. 그러나 useImperativeHandle은 리액트가 부모 컴포넌트인 MyInput의 ref의 값으로 useImperativeHandle이 반환하는 특별한 객체를 저장하도록 만든다. 따라서 Form 컴포넌트에서느 inputRef.current는 오직 focus 메서드만 갖고 있게 된다. 이러한 경우 ref를 제어하는 것은 실제 DOM node가 아니라 userImperativeHandle 호출 안에서 생성한 커스텀 객체이다.

# 리액트가 ref들에 데이터를 저장하는 시점

리액트에서 모든 업데이트는 두 가지 맥락으로 나뉜다.

- render: 리액트가 화면에 어떤 것들이 있어야하는지 알기 위해 컴포넌트들을 호출하여, before/after를 비교한다.
- commit: 리액트가 DOM에 변경 사항을 적용한다.

보통 우리는 rendering하는 동안에 리액트가 ref에 접근하기를 원하지 않는다. 이것은 DOM 노드들을 ref가 갖고 있을 수 있는 이유기도 하다. 첫번째 render 동안에 DOM 노드들은 아직 생성이 되지 않으므로 ref.current는 null이다. 그리고 이후에 변경이 생긴경우 변경 사항을 확인하는 렌더링 동안에 DOM 노드들은 아직도 생성되지 않은 상태이다. 즉, 첫 번째 렌더링 render/commit 이후 두 번째 렌더링 render까지는 ref에 우리가 원하는 DOM node들이 할당되지 않는다.

React는 두 번째 commit 단계에서야 ref.current에 DOM 노드들을 할당한다. DOM이 업데이트 되기 전에 React는 ref.current 값들을 null로 설정해 놓는다. 그리고 DOM이 업데이트 되면, 즉시 해당하는 DOM 노드들을 ref에 젖아한다.

일반적으로 ref에 접근할 때는 event handler들을 사용한다. 만약 ref로 무언가를 하고 싶다면 ref 자체에는 특별한 이벤트를 걸 수 없으므로, Effect가 필요하다.

## flushSync를 통해 ref에 리액트의 로컬 상태 변경을 동기적으로 전파하기

만약 새로운 todo 요소가 추가 될 경우 마지막에 추가된 해당 요소로 스크롤을 내려야한다고 가정해보자. 아마 아래와 같이 구현할 것이다.

App.js

```jsx
import { useState, useRef } from "react"

export default function TodoList() {
  const listRef = useRef(null)
  const [text, setText] = useState("")
  const [todos, setTodos] = useState(initialTodos)

  function handleAdd() {
    const newTodo = { id: nextId++, text: text }
    setText("")
    setTodos([...todos, newTodo])
    listRef.current.lastChild.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    })
  }

  return (
    <>
      <button onClick={handleAdd}>Add</button>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <ul ref={listRef}>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.text}</li>
        ))}
      </ul>
    </>
  )
}

let nextId = 0
let initialTodos = []
for (let i = 0; i < 20; i++) {
  initialTodos.push({
    id: nextId++,
    text: "Todo #" + (i + 1),
  })
}
```

하지만 제대로 동작하지 않는데, 문제는 아래의 두 라인이다.

```jsx
setTodos([...todos, newTodo])
listRef.current.lastChild.scrollIntoView()
```

여기서 setTodos는 즉시 DOM을 변경하지 않는다. 그래서 바로 다음 코드인 scrollIntoView가 호출될 때, 새로운 todo 요소는 아직 추가되지 않은 상태이다.

이 문제를 수정하려면 강제로 리액트가 DOM을 todos 상태와 동기적으로 업데이트 하도록 만들어야한다. react-dom에서 flushSync를 가져와서 상태 변경 코드를 감싸면 된다.

```jsx
flushSync(() => {
  setTodos([...todos, newTodo])
})
listRef.current.lastChild.scrollIntoView()
```

이제, 리액트는 flushSync로 감싼 코드가 실행된 후에 바로 DOM을 업데이트한다. 이제 scrollIntoView가 호출되기 전에 새로 추가된 todo 요소의 DOM 요소는 이미 존재하는 상태이므로
