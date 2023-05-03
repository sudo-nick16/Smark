import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Bookmark = {
  __typename?: 'Bookmark';
  _id: Scalars['String'];
  favorite: Scalars['Boolean'];
  icon: Scalars['String'];
  listId: Scalars['String'];
  title: Scalars['String'];
  url: Scalars['String'];
  userId: Scalars['String'];
};

export type BookmarkInput = {
  icon: Scalars['String'];
  listId: Scalars['String'];
  title: Scalars['String'];
  url: Scalars['String'];
};

export type BookmarkList = {
  __typename?: 'BookmarkList';
  _id: Scalars['String'];
  default: Scalars['Boolean'];
  favorite: Scalars['Boolean'];
  public: Scalars['Boolean'];
  title: Scalars['String'];
  userId: Scalars['String'];
};

export type BookmarkListComplete = {
  __typename?: 'BookmarkListComplete';
  _id: Scalars['String'];
  children: Array<Bookmark>;
  default: Scalars['Boolean'];
  favorite: Scalars['Boolean'];
  public: Scalars['Boolean'];
  title: Scalars['String'];
  userId: Scalars['String'];
};

export type MeResponse = {
  __typename?: 'MeResponse';
  bookmarkLists: Array<BookmarkListComplete>;
  user: User;
};

export type Mutation = {
  __typename?: 'Mutation';
  addBookmark?: Maybe<Scalars['Boolean']>;
  addBookmarkList?: Maybe<BookmarkList>;
  addBookmarkToDefaultList?: Maybe<Scalars['Boolean']>;
  removeBookmarkList?: Maybe<Scalars['Boolean']>;
  removeBookmarkLists?: Maybe<Scalars['Boolean']>;
};


export type MutationAddBookmarkArgs = {
  bookmark: BookmarkInput;
};


export type MutationAddBookmarkListArgs = {
  title: Scalars['String'];
};


export type MutationAddBookmarkToDefaultListArgs = {
  bookmark: BookmarkInput;
};


export type MutationRemoveBookmarkListArgs = {
  listId: Scalars['String'];
};


export type MutationRemoveBookmarkListsArgs = {
  listIds: Array<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  bookmarks?: Maybe<Array<Bookmark>>;
  me?: Maybe<MeResponse>;
  user?: Maybe<User>;
};


export type QueryBookmarksArgs = {
  listId: Scalars['String'];
};

export type User = {
  __typename?: 'User';
  _id: Scalars['String'];
  email: Scalars['String'];
  img: Scalars['String'];
  name: Scalars['String'];
  tokenVersion: Scalars['Int'];
  username: Scalars['String'];
};

export type AddBookmarkMutationVariables = Exact<{
  bookmark: BookmarkInput;
}>;


export type AddBookmarkMutation = { __typename?: 'Mutation', addBookmark?: boolean | null };

export type AddBookmarkListMutationVariables = Exact<{
  title: Scalars['String'];
}>;


export type AddBookmarkListMutation = { __typename?: 'Mutation', addBookmarkList?: { __typename?: 'BookmarkList', title: string, _id: string, favorite: boolean, public: boolean, userId: string } | null };

export type GetBookmarksQueryVariables = Exact<{
  listId: Scalars['String'];
}>;


export type GetBookmarksQuery = { __typename?: 'Query', bookmarks?: Array<{ __typename?: 'Bookmark', _id: string, listId: string, title: string, url: string, icon: string }> | null };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'MeResponse', user: { __typename?: 'User', _id: string, name: string, email: string, username: string, img: string }, bookmarkLists: Array<{ __typename?: 'BookmarkListComplete', _id: string, title: string, favorite: boolean, public: boolean, children: Array<{ __typename?: 'Bookmark', _id: string, icon: string, title: string, url: string }> }> } | null };

export type RemoveBookmarkListMutationVariables = Exact<{
  listId: Scalars['String'];
}>;


export type RemoveBookmarkListMutation = { __typename?: 'Mutation', removeBookmarkList?: boolean | null };

export type RemoveBookmarkListsMutationVariables = Exact<{
  listIds: Array<Scalars['String']> | Scalars['String'];
}>;


export type RemoveBookmarkListsMutation = { __typename?: 'Mutation', removeBookmarkLists?: boolean | null };


export const AddBookmarkDocument = gql`
    mutation AddBookmark($bookmark: BookmarkInput!) {
  addBookmark(bookmark: $bookmark)
}
    `;

export function useAddBookmarkMutation() {
  return Urql.useMutation<AddBookmarkMutation, AddBookmarkMutationVariables>(AddBookmarkDocument);
};
export const AddBookmarkListDocument = gql`
    mutation addBookmarkList($title: String!) {
  addBookmarkList(title: $title) {
    title
    _id
    favorite
    public
    userId
  }
}
    `;

export function useAddBookmarkListMutation() {
  return Urql.useMutation<AddBookmarkListMutation, AddBookmarkListMutationVariables>(AddBookmarkListDocument);
};
export const GetBookmarksDocument = gql`
    query getBookmarks($listId: String!) {
  bookmarks(listId: $listId) {
    _id
    listId
    title
    url
    icon
  }
}
    `;

export function useGetBookmarksQuery(options: Omit<Urql.UseQueryArgs<GetBookmarksQueryVariables>, 'query'>) {
  return Urql.useQuery<GetBookmarksQuery, GetBookmarksQueryVariables>({ query: GetBookmarksDocument, ...options });
};
export const MeDocument = gql`
    query Me {
  me {
    user {
      _id
      name
      email
      username
      img
    }
    bookmarkLists {
      _id
      title
      favorite
      public
      children {
        _id
        icon
        title
        url
      }
    }
  }
}
    `;

export function useMeQuery(options?: Omit<Urql.UseQueryArgs<MeQueryVariables>, 'query'>) {
  return Urql.useQuery<MeQuery, MeQueryVariables>({ query: MeDocument, ...options });
};
export const RemoveBookmarkListDocument = gql`
    mutation RemoveBookmarkList($listId: String!) {
  removeBookmarkList(listId: $listId)
}
    `;

export function useRemoveBookmarkListMutation() {
  return Urql.useMutation<RemoveBookmarkListMutation, RemoveBookmarkListMutationVariables>(RemoveBookmarkListDocument);
};
export const RemoveBookmarkListsDocument = gql`
    mutation RemoveBookmarkLists($listIds: [String!]!) {
  removeBookmarkLists(listIds: $listIds)
}
    `;

export function useRemoveBookmarkListsMutation() {
  return Urql.useMutation<RemoveBookmarkListsMutation, RemoveBookmarkListsMutationVariables>(RemoveBookmarkListsDocument);
};