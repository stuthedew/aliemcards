import React, { PureComponent } from 'react';
import { post } from 'axios';

import CardList from '../cards/CardList';

export default class Home extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      newest: [],
      updated: [],
    };
  }

  componentDidMount() {
    post('/graphql', {
      query: `
        query {
          recentlyAdded {
            ...cardFragment
          }
          recentlyUpdated {
            ...cardFragment
          }
        }

        fragment cardFragment on Card {
          id
          title
          categories {
            id
            name
          }
        }
      `,
    })
    .then(res => {
      if (res.status !== 200) throw res.status;
      const { recentlyAdded, recentlyUpdated } = res.data.data;
      this.setState({ newest: recentlyAdded, updated: recentlyUpdated });
    })
    .catch(err => console.error(`Error: API response status code = ${err}`));
  }

  render() {
    return (
      <div className="row row--wrap">
        <div className="column column--50">
          <h1>New Cards</h1>
          {this.state.newest.length > 0 &&
            <CardList cards={this.state.newest} />
          }
        </div>
        <div className="column column--50">
          <h1>Updated Cards</h1>
          {this.state.updated.length > 0 &&
            <CardList cards={this.state.updated.filter(card => card.updates !== null)} />
          }
        </div>
      </div>
    );
  }
}
