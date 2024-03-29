import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import api from '../../services/api';
import Container from '../../components/Container';
import { Loading, Owner, IssueList, Filter, PageActions } from './styles';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    issueState: 'all',
    page: 1,
  };

  componentDidMount() {
    this.fetchIssues();
  }

  hadleIssueState = e => {
    if (e.target.checked) {
      this.setState({ issueState: e.target.value, page: 1 });
      this.fetchIssues();
      this.loadIssues();
    }
  };

  fetchIssues = async () => {
    const { match } = this.props;
    const { issueState } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: issueState,
          per_page: 5,
          page: 1,
        },
      }),
    ]);

    this.setState({
      loading: false,
      repository: repository.data,
      issues: issues.data,
    });
  };

  loadIssues = async () => {
    const { match } = this.props;
    const { issueState, page } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const response = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: issueState,
        per_page: 5,
        page,
      },
    });

    this.setState({ issues: response.data });
  };

  handlePage = async action => {
    const { page } = this.state;
    await this.setState({
      page: action === 'back' ? page - 1 : page + 1,
    });
    this.loadIssues();
  };

  render() {
    const { repository, issues, loading, issueState, page } = this.state;
    if (loading) {
      return <Loading>Carregando</Loading>;
    }
    return (
      <Container>
        <Owner>
          <Link to="/">Return to repositories</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <Filter>
          <li>
            <input
              type="radio"
              name="state"
              value="all"
              checked={issueState === 'all'}
              onChange={this.hadleIssueState}
            />
            <label>All</label>
          </li>
          <li>
            <input
              type="radio"
              name="state"
              value="open"
              checked={issueState === 'open'}
              onChange={this.hadleIssueState}
            />
            <label>Open</label>
          </li>
          <li>
            <input
              type="radio"
              name="state"
              value="closed"
              checked={issueState === 'closed'}
              onChange={this.hadleIssueState}
            />
            <label>Closed</label>
          </li>
        </Filter>

        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(lable => (
                    <span key={String(lable.id)}>{lable.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
        <PageActions>
          <button
            type="button"
            disabled={page < 2}
            onClick={() => this.handlePage('back')}
          >
            Anterior
          </button>
          <span>Página {page}</span>
          <button type="button" onClick={() => this.handlePage('next')}>
            Próximo
          </button>
        </PageActions>
      </Container>
    );
  }
}
