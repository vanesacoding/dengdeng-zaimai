-- Supabase 将 pgcrypto 安装在 extensions schema；安全定义函数需要显式限定 digest。
create or replace function public.create_pairing_phrase(p_phrase text, p_relationship_name text default '省钱搭子')
returns uuid language plpgsql security definer set search_path=public as $$
declare normalized text; phrase_hash text; relation_id uuid;
begin
  if auth.uid() is null then raise exception '请先创建临时账户'; end if;
  normalized := normalize_phrase(p_phrase);
  if char_length(normalized) < 4 or char_length(normalized) > 20 then raise exception '暗号需为 4 到 20 个字'; end if;
  phrase_hash := encode(extensions.digest(convert_to(normalized, 'UTF8'), 'sha256'), 'hex');
  delete from supervision_relationships where status='PENDING' and expires_at < now();
  if exists(select 1 from supervision_relationships where inviter_id=auth.uid() and status in('PENDING','ACTIVE')) then raise exception '你已经有正在进行的配对'; end if;
  begin
    insert into supervision_relationships(inviter_id,invite_code,relationship_name,status,expires_at)
    values(auth.uid(),phrase_hash,coalesce(nullif(trim(p_relationship_name),''),'省钱搭子'),'PENDING',now()+interval '10 minutes') returning id into relation_id;
  exception when unique_violation then raise exception '这个暗号正在被使用，请换一个更特别的暗号';
  end;
  return relation_id;
end$$;

create or replace function public.join_pairing_phrase(p_phrase text)
returns uuid language plpgsql security definer set search_path=public as $$
declare phrase_hash text; relation_id uuid;
begin
  if auth.uid() is null then raise exception '请先创建临时账户'; end if;
  phrase_hash := encode(extensions.digest(convert_to(normalize_phrase(p_phrase), 'UTF8'), 'sha256'), 'hex');
  update supervision_relationships set invitee_id=auth.uid()
  where id=(select id from supervision_relationships where invite_code=phrase_hash and status='PENDING' and invitee_id is null and expires_at>now() and inviter_id<>auth.uid() for update skip locked limit 1)
  returning id into relation_id;
  if relation_id is null then raise exception '没有找到这个暗号，可能已失效或正在等待确认'; end if;
  return relation_id;
end$$;
