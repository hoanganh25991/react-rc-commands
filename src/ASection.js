import React from "react"

class Section extends React.PureComponent {
  state = {
    visible: true
  }

  toggle = () => {
    const {visible}= this.state
    const nextVisible = !visible
    this.setState({visible: nextVisible})
  }

  componentWillMount(){
    const {visible} = this.state
    const {visible: vProp} = this.props
    const shouldOverride = typeof vProp !== "undefined" && vProp !== visible
    if(shouldOverride)
      this.setState({visible: vProp})
  }

  render(){
    const {visible} = this.state
    const {title} = this.props
    return (
      <div>
        <div className={"flex"}>
          <div className={"underline flex1 header"}>{title}</div>
          <button onClick={this.toggle}>{visible ? "-" : "+"}</button>
        </div>
        {visible && this.props.children}
      </div>
    )
  }
}

export default Section