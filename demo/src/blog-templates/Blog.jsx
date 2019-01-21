import React from "react";
import { graphql } from "gatsby";

// Component.
export default function Blog({ data }) {
	const file = data.templated;
	return (
		<article>
			<pre>{JSON.stringify(file)}</pre>
		</article>
	);
}

// Query.
export const query = graphql`
	query($id: String!) {
		templated(id: { eq: $id }) {
			rootPath
			params {
				year
				month
				day
				title
			}
			slug
			content
		}
	}
`;
