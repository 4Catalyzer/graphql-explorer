import React from 'react';
import clsx from 'clsx';
import styles from './HomepageFeatures.module.css';
import useBaseUrl from '@docusaurus/useBaseUrl';

const FeatureList = [
  {
    title: 'Ready to go',
    description: (
      <>
        With GraphQL Explorer you can start exploring your schema and data without writing any visual components or forms.
      </>
    ),
    img: '/img/capture1.gif',
  },
  {
    title: 'Perfect for admin UIs',
    description: (
      <>
        GraphQL Explorer is perfect for management apps, admin UIs, or any other data intensive app. where custom styling is not the main focus.
      </>
    ),
    img: '/img/capture2.png',
  },
  {
    title: 'Customizable',
    description: (
      <>
        GraphQL Explorer can be customized to your needs. It has a simple API to customize the look and feel, add special resolvers for types and inputs.
      </>
    ),
    img: '/img/capture3.png',
  },
];

function Feature({img, title, description}) {
  return (
    <div className="row row--no-gutters margin-bottom--lg">
      <div className="col col--4 padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div className="col col--8">
        <img src={useBaseUrl(img)} className="item shadow--md" />
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        {FeatureList.map((props, idx) => (
          <Feature key={idx} {...props} />
        ))}
      </div>
    </section>
  );
}
