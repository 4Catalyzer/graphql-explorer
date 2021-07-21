import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function Demo() {
  return (
    <>
      <iframe
        src={useBaseUrl("/try.html")}
        style={{width:'100%', height:'100%', position: 'absolute', border:0, overflow:'hidden' }}
        title="graphql-explorer demo"
        sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
      />
      <Link
        className="button button--primary"
        style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
        }}
        to="/">
        Back to documentation
      </Link>
    </>
  )
}
