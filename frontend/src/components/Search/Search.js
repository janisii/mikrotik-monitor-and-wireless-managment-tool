import React from "react";

class Search extends React.Component {
  state = {
    q: ""
  };

  onInputChange = e => {
    this.setState({ q: e.target.value }, () => {
      this.props.handleSearch(this.state.q);
    });
  };

  onFormSubmit = e => {
    e.preventDefault();
    this.props.handleSearch(this.state.q);
  };

  render() {
    return (
      <div className="section" style={{ paddingBottom: 0 }}>
        <form className="search-form container" onSubmit={this.onFormSubmit}>
          <div className="field">
            <div className="control has-icons-left">
              <input
                className="input"
                type="text"
                placeholder=""
                onChange={this.onInputChange}
              />
              <span className="icon is-small is-left">
                <i className="fas fa-search" />
              </span>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

export default Search;
