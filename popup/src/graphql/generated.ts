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

export type AddBookmarkToDefaultListMutationVariables = Exact<{
  bookmark: BookmarkInput;
}>;


export type AddBookmarkToDefaultListMutation = { __typename?: 'Mutation', addBookmarkToDefaultList?: boolean | null };


export const AddBookmarkToDefaultListDocument = gql`
    mutation AddBookmarkToDefaultList($bookmark: BookmarkInput!) {
  addBookmarkToDefaultList(bookmark: $bookmark)
}
    `;

export function useAddBookmarkToDefaultListMutation() {
  return Urql.useMutation<AddBookmarkToDefaultListMutation, AddBookmarkToDefaultListMutationVariables>(AddBookmarkToDefaultListDocument);
};