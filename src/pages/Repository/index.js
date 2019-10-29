import React from 'react';

// import { Container } from './styles';

/**
 *
 * @param {match} comes inside props due to the route
 */
export default function Repository({ match }) {
  return <h1>Repository: {decodeURIComponent(match.params.repository)}</h1>;
}
